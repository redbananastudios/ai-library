#!/usr/bin/env python3
"""Show status of all items in the library."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    items = get_all_items()
    registry = load_registry()
    reg_map = {r["id"]: r for r in registry}

    print(f"\nAI Library Status ({len(items)} items)")
    print("=" * 90)
    print(f"{'ID':<35} {'Type':<10} {'Ver':<8} {'Status':<12} {'Claude':<8} {'Paperclip':<12}")
    print("-" * 90)

    for item_id, item_type, item_dir in items:
        spec = load_spec(item_dir)
        reg = reg_map.get(item_id, {})
        version = spec.get("version", "?")
        status = spec.get("status", "?")

        # Check Claude build
        if item_type in ("agent", "subagent"):
            claude_built = (GEN_CLAUDE_AGENTS / f"{item_id}.md").exists()
        else:
            claude_built = (GEN_CLAUDE_SKILLS / item_id / "SKILL.md").exists()

        # Check Paperclip build
        if item_type in ("agent", "subagent"):
            pc_built = (GEN_PAPERCLIP_AGENTS / item_id / "payload.json").exists()
        else:
            pc_built = (GEN_PAPERCLIP_SKILLS / item_id / "payload.json").exists()

        claude_str = "built" if claude_built else "-"
        pc_str = "built" if pc_built else "-"

        # Check published
        if reg.get("published_claude_path"):
            claude_str = "published"
        pc_status = reg.get("published_paperclip_status", "")
        if pc_status:
            pc_str = pc_status

        print(f"{item_id:<35} {item_type:<10} {version:<8} {status:<12} {claude_str:<8} {pc_str:<12}")

    print("-" * 90)

    # Summary
    skills_count = sum(1 for _, t, _ in items if t == "skill")
    agents_count = sum(1 for _, t, _ in items if t in ("agent", "subagent"))
    print(f"\nSkills: {skills_count}  |  Agents: {agents_count}  |  Total: {len(items)}")

    # Check for items not built
    not_built = []
    for item_id, item_type, _ in items:
        if item_type in ("agent", "subagent"):
            if not (GEN_CLAUDE_AGENTS / f"{item_id}.md").exists():
                not_built.append(item_id)
        else:
            if not (GEN_CLAUDE_SKILLS / item_id / "SKILL.md").exists():
                not_built.append(item_id)
    if not_built:
        print(f"\nNot built: {', '.join(not_built)}")
        print("Run: python scripts/build-all.py")


if __name__ == "__main__":
    main()
