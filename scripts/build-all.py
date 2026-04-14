#!/usr/bin/env python3
"""Build all items in the library for Claude, Paperclip and Codex targets."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    items = get_all_items()
    if not items:
        print("No items found.")
        sys.exit(1)

    print(f"Building {len(items)} items...\n")
    success = 0
    failed = 0

    for item_id, item_type, item_dir in items:
        try:
            spec = load_spec(item_dir)
            targets = spec.get("compatible_targets", ["claude", "paperclip", "codex"])
            if isinstance(targets, str):
                targets = [t.strip() for t in targets.split(",")]

            if item_type in ("agent", "subagent"):
                if "claude" in targets:
                    build_claude_agent(item_dir)
                if "paperclip" in targets:
                    build_paperclip_item(item_dir)
                if "codex" in targets:
                    build_codex_agent(item_dir)
            else:
                if "claude" in targets:
                    build_claude_skill(item_dir)
                if "paperclip" in targets:
                    build_paperclip_item(item_dir)
                if "codex" in targets:
                    build_codex_skill(item_dir)

            # Update registry
            gen_claude = ""
            if item_type in ("agent", "subagent"):
                cp = GEN_CLAUDE_AGENTS / f"{item_id}.md"
                if cp.exists():
                    gen_claude = str(cp.relative_to(ROOT))
            else:
                cp = GEN_CLAUDE_SKILLS / item_id / "SKILL.md"
                if cp.exists():
                    gen_claude = str((GEN_CLAUDE_SKILLS / item_id).relative_to(ROOT))

            pp = (GEN_PAPERCLIP_SKILLS if item_type == "skill" else GEN_PAPERCLIP_AGENTS) / item_id / "payload.json"
            gen_paperclip = str(pp.parent.relative_to(ROOT)) if pp.exists() else ""

            gen_codex = ""
            if item_type in ("agent", "subagent"):
                cxp = GEN_CODEX_AGENTS / f"{item_id}.toml"
                if cxp.exists():
                    gen_codex = str(cxp.relative_to(ROOT))
            else:
                cxp = GEN_CODEX_SKILLS / item_id / "SKILL.md"
                if cxp.exists():
                    gen_codex = str((GEN_CODEX_SKILLS / item_id).relative_to(ROOT))

            upsert_registry({
                "id": item_id,
                "name": spec.get("name", item_id),
                "type": item_type,
                "version": spec.get("version", "0.1.0"),
                "status": spec.get("status", "imported"),
                "upstream_repo_or_source": spec.get("source_url", ""),
                "source_url": spec.get("source_url", ""),
                "imported_from_pack": spec.get("imported_from_pack", ""),
                "compatible_targets": targets,
                "source_path": str(item_dir.relative_to(ROOT)),
                "generated_claude_path": gen_claude,
                "generated_paperclip_path": gen_paperclip,
                "generated_codex_path": gen_codex,
                "published_claude_path": "",
                "published_paperclip_status": "generated",
                "published_codex_path": "",
                "requirements": spec.get("requirements", []),
                "notes": spec.get("notes", ""),
            })

            print(f"  OK    {item_id}")
            success += 1
        except Exception as e:
            print(f"  FAIL  {item_id}: {e}")
            failed += 1

    print(f"\n{'='*50}")
    print(f"Built: {success} succeeded, {failed} failed out of {len(items)} items")


if __name__ == "__main__":
    main()
