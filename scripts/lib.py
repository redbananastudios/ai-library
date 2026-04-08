"""
ai-library core pipeline library.
Shared utilities for validate, build, import, publish, and status scripts.
"""

import json
import os
import shutil
import subprocess
import sys
import re
import datetime
from pathlib import Path
from typing import Any, Optional

# --- Paths ---
ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = ROOT / "skills"
AGENTS_DIR = ROOT / "agents"
GEN_CLAUDE_SKILLS = ROOT / "generated" / "claude" / "skills"
GEN_CLAUDE_AGENTS = ROOT / "generated" / "claude" / "agents"
GEN_PAPERCLIP_SKILLS = ROOT / "generated" / "paperclip" / "skills"
GEN_PAPERCLIP_AGENTS = ROOT / "generated" / "paperclip" / "agents"
BUILD_DIR = ROOT / "build"
LOGS_DIR = BUILD_DIR / "logs"
MANIFESTS_DIR = BUILD_DIR / "manifests"
VERSIONS_FILE = ROOT / "versions.json"
REGISTRY_JSON = BUILD_DIR / "library-registry.json"
REGISTRY_MD = BUILD_DIR / "library-registry.md"
SCRIPTS_DIR = ROOT / "scripts"

# Publish targets (project-level Claude paths)
# These are relative to the project root that contains .claude/
PROJECT_ROOT = ROOT.parent  # O:/ in this case
CLAUDE_SKILLS_TARGET = PROJECT_ROOT / ".claude" / "skills"
CLAUDE_AGENTS_TARGET = PROJECT_ROOT / ".claude" / "agents"


def log(msg: str, level: str = "INFO"):
    ts = datetime.datetime.now().isoformat(timespec="seconds")
    line = f"[{ts}] [{level}] {msg}"
    print(line)
    log_file = LOGS_DIR / f"{datetime.date.today().isoformat()}.log"
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def read_json(path: Path) -> Any:
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def write_json(path: Path, data: Any):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    log(f"Wrote {path}")


def write_text(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def read_text(path: Path) -> str:
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return ""


def read_yaml_frontmatter(path: Path) -> dict:
    """Read YAML frontmatter from a markdown file (basic parser)."""
    text = read_text(path)
    if not text.startswith("---"):
        return {}
    end = text.find("---", 3)
    if end == -1:
        return {}
    fm = text[3:end].strip()
    result = {}
    for line in fm.split("\n"):
        if ":" in line:
            key, val = line.split(":", 1)
            result[key.strip()] = val.strip()
    return result


# --- Spec helpers ---

def default_spec(item_id: str, item_type: str = "skill") -> dict:
    return {
        "id": item_id,
        "name": item_id.replace("-", " ").title(),
        "type": item_type,
        "version": "0.1.0",
        "source_url": "",
        "source_kind": "github",
        "compatible_targets": ["claude", "paperclip"],
        "changelog_summary": "Initial import",
        "requirements": [],
        "status": "imported",
        "description": "",
        "trigger": "",
    }


def load_spec(item_dir: Path) -> dict:
    """Load spec.yaml as dict (basic YAML parser for simple flat specs)."""
    spec_path = item_dir / "spec.yaml"
    if not spec_path.exists():
        return {}
    text = read_text(spec_path)
    result = {}
    for line in text.strip().split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip()
            # Handle lists
            if val.startswith("[") and val.endswith("]"):
                items = val[1:-1].split(",")
                val = [i.strip().strip('"').strip("'") for i in items if i.strip()]
            elif val.startswith('"') and val.endswith('"'):
                val = val[1:-1]
            elif val.startswith("'") and val.endswith("'"):
                val = val[1:-1]
            result[key] = val
    return result


def save_spec(item_dir: Path, spec: dict):
    """Save spec dict as spec.yaml (basic serializer)."""
    lines = []
    for key, val in spec.items():
        if isinstance(val, list):
            lines.append(f'{key}: [{", ".join(repr(v) for v in val)}]')
        elif isinstance(val, bool):
            lines.append(f"{key}: {'true' if val else 'false'}")
        else:
            # Quote strings that contain special chars
            sv = str(val)
            if any(c in sv for c in ":#{}[]|>&*?!%@`") or sv == "":
                lines.append(f'{key}: "{sv}"')
            else:
                lines.append(f"{key}: {sv}")
    write_text(item_dir / "spec.yaml", "\n".join(lines) + "\n")


# --- Registry ---

def load_registry() -> list:
    data = read_json(REGISTRY_JSON)
    if isinstance(data, list):
        return data
    return data.get("items", [])


def save_registry(items: list):
    write_json(REGISTRY_JSON, {"items": items, "updated": datetime.datetime.now().isoformat()})
    # Also write markdown
    lines = ["# AI Library Registry\n"]
    lines.append(f"Updated: {datetime.datetime.now().isoformat(timespec='seconds')}\n")
    lines.append(f"Total items: {len(items)}\n")
    lines.append("| ID | Name | Type | Version | Status | Claude | Paperclip |")
    lines.append("|---|---|---|---|---|---|---|")
    for item in sorted(items, key=lambda x: x.get("id", "")):
        cpath = item.get("generated_claude_path", "")
        ppath = item.get("generated_paperclip_path", "")
        cstatus = "yes" if cpath else "no"
        pstatus = item.get("published_paperclip_status", "no")
        lines.append(
            f"| {item.get('id','')} | {item.get('name','')} | {item.get('type','')} "
            f"| {item.get('version','')} | {item.get('status','')} | {cstatus} | {pstatus} |"
        )
    write_text(REGISTRY_MD, "\n".join(lines) + "\n")


def upsert_registry(entry: dict):
    items = load_registry()
    found = False
    for i, item in enumerate(items):
        if item.get("id") == entry.get("id"):
            items[i] = {**item, **entry}
            found = True
            break
    if not found:
        items.append(entry)
    save_registry(items)


# --- Versions ---

def load_versions() -> dict:
    return read_json(VERSIONS_FILE) or {}


def save_versions(data: dict):
    write_json(VERSIONS_FILE, data)


def update_version(item_id: str, version: str, item_type: str = "skill"):
    versions = load_versions()
    versions[item_id] = {
        "version": version,
        "type": item_type,
        "updated": datetime.datetime.now().isoformat(),
    }
    save_versions(versions)


# --- Build helpers ---

def build_claude_skill(item_dir: Path) -> Path:
    """Build a Claude-native skill from a source-of-truth item."""
    spec = load_spec(item_dir)
    item_id = spec.get("id", item_dir.name)
    item_type = spec.get("type", "skill")

    if item_type in ("agent", "subagent"):
        return build_claude_agent(item_dir)

    out_dir = GEN_CLAUDE_SKILLS / item_id
    out_dir.mkdir(parents=True, exist_ok=True)

    prompt_path = item_dir / "prompt.md"
    prompt = read_text(prompt_path) if prompt_path.exists() else f"# {spec.get('name', item_id)}\n\nPlaceholder skill.\n"

    # Build SKILL.md with frontmatter
    trigger = spec.get("trigger", "")
    description = spec.get("description", spec.get("name", item_id))
    fm_lines = [
        "---",
        f"name: {item_id}",
        f"description: {description}",
    ]
    if trigger:
        fm_lines.append(f"trigger: {trigger}")
    fm_lines.append("---")
    fm_lines.append("")

    skill_md = "\n".join(fm_lines) + prompt

    write_text(out_dir / "SKILL.md", skill_md)

    # Copy references/templates/scripts if present
    for subdir in ("references", "templates", "scripts"):
        src = item_dir / subdir
        dst = out_dir / subdir
        if src.exists() and any(src.iterdir()):
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)

    log(f"Built Claude skill: {item_id}")
    return out_dir


def build_claude_agent(item_dir: Path) -> Path:
    """Build a Claude-native agent from a source-of-truth item."""
    spec = load_spec(item_dir)
    item_id = spec.get("id", item_dir.name)

    out_dir = GEN_CLAUDE_AGENTS
    out_dir.mkdir(parents=True, exist_ok=True)

    prompt_path = item_dir / "prompt.md"
    prompt = read_text(prompt_path) if prompt_path.exists() else f"# {spec.get('name', item_id)}\n\nPlaceholder agent.\n"

    description = spec.get("description", spec.get("name", item_id))

    # Claude agents are single .md files with YAML frontmatter
    fm_lines = [
        "---",
        f"name: {item_id}",
        f"description: {description}",
    ]
    # Add allowed tools if specified
    allowed_tools = spec.get("allowed_tools", "")
    if allowed_tools:
        fm_lines.append(f"allowed_tools: {allowed_tools}")
    fm_lines.append("---")
    fm_lines.append("")

    agent_md = "\n".join(fm_lines) + prompt
    out_path = out_dir / f"{item_id}.md"
    write_text(out_path, agent_md)

    log(f"Built Claude agent: {item_id}")
    return out_path


def build_paperclip_item(item_dir: Path) -> Path:
    """Build a Paperclip-ready payload from a source-of-truth item."""
    spec = load_spec(item_dir)
    item_id = spec.get("id", item_dir.name)
    item_type = spec.get("type", "skill")

    if item_type in ("agent", "subagent"):
        out_dir = GEN_PAPERCLIP_AGENTS / item_id
    else:
        out_dir = GEN_PAPERCLIP_SKILLS / item_id

    out_dir.mkdir(parents=True, exist_ok=True)

    prompt_path = item_dir / "prompt.md"
    prompt = read_text(prompt_path)

    # Paperclip payload format
    payload = {
        "id": item_id,
        "name": spec.get("name", item_id),
        "type": item_type,
        "version": spec.get("version", "0.1.0"),
        "description": spec.get("description", ""),
        "prompt": prompt,
        "source_url": spec.get("source_url", ""),
        "requirements": spec.get("requirements", []),
        "metadata": {
            "source_kind": spec.get("source_kind", "github"),
            "compatible_targets": spec.get("compatible_targets", ["claude", "paperclip"]),
            "changelog_summary": spec.get("changelog_summary", ""),
        }
    }

    write_json(out_dir / "payload.json", payload)

    # Also write the raw prompt for easy review
    if prompt:
        write_text(out_dir / "prompt.md", prompt)

    log(f"Built Paperclip {item_type}: {item_id}")
    return out_dir


# --- Publish helpers ---

def publish_to_claude(item_id: str, item_type: str = "skill") -> bool:
    """Copy generated Claude artifact to .claude/ target."""
    if item_type in ("agent", "subagent"):
        src = GEN_CLAUDE_AGENTS / f"{item_id}.md"
        dst = CLAUDE_AGENTS_TARGET / f"{item_id}.md"
        if not src.exists():
            log(f"Claude agent not built: {item_id}", "ERROR")
            return False
        dst.parent.mkdir(parents=True, exist_ok=True)
        # Backup existing
        if dst.exists():
            backup = dst.with_suffix(f".md.bak.{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}")
            shutil.copy2(dst, backup)
            log(f"Backed up existing: {dst} -> {backup}")
        shutil.copy2(src, dst)
    else:
        src_dir = GEN_CLAUDE_SKILLS / item_id
        dst_dir = CLAUDE_SKILLS_TARGET / item_id
        if not src_dir.exists():
            log(f"Claude skill not built: {item_id}", "ERROR")
            return False
        dst_dir.parent.mkdir(parents=True, exist_ok=True)
        # Backup existing
        if dst_dir.exists():
            backup = dst_dir.with_name(f"{item_id}.bak.{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}")
            shutil.copytree(dst_dir, backup)
            shutil.rmtree(dst_dir)
            log(f"Backed up existing: {dst_dir} -> {backup}")
        shutil.copytree(src_dir, dst_dir)

    log(f"Published to Claude: {item_id}")
    return True


def get_all_items() -> list[tuple[str, str, Path]]:
    """Return (id, type, path) for all source-of-truth items."""
    items = []
    for d in sorted(SKILLS_DIR.iterdir()) if SKILLS_DIR.exists() else []:
        if d.is_dir() and (d / "spec.yaml").exists():
            spec = load_spec(d)
            items.append((spec.get("id", d.name), spec.get("type", "skill"), d))
    for d in sorted(AGENTS_DIR.iterdir()) if AGENTS_DIR.exists() else []:
        if d.is_dir() and (d / "spec.yaml").exists():
            spec = load_spec(d)
            items.append((spec.get("id", d.name), spec.get("type", "agent"), d))
    return items
