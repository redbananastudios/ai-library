#!/usr/bin/env python3
"""Publish all built items to Codex (~/.codex/skills/ and ~/.codex/agents/).

The publish target respects the CODEX_HOME environment variable; if unset it
defaults to ``~/.codex``. Only items whose spec.yaml lists ``codex`` in
``compatible_targets`` are considered published here (others are skipped).
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    items = get_all_items()
    if not items:
        print("No items found.")
        sys.exit(1)

    print(f"Publishing {len(items)} items to Codex...\n")
    success = 0
    failed = 0
    skipped = 0

    for item_id, item_type, item_dir in items:
        try:
            spec = load_spec(item_dir)
            targets = spec.get("compatible_targets", ["claude", "paperclip", "codex"])
            if isinstance(targets, str):
                targets = [t.strip() for t in targets.split(",")]
            if "codex" not in targets:
                print(f"  SKIP  {item_id} (codex not in compatible_targets)")
                skipped += 1
                continue

            ok = publish_to_codex(item_id, item_type)
            if ok:
                if item_type in ("agent", "subagent"):
                    path = str((CODEX_AGENTS_TARGET / f"{item_id}.toml").as_posix())
                else:
                    path = str((CODEX_SKILLS_TARGET / item_id).as_posix())
                upsert_registry({"id": item_id, "published_codex_path": path})
                print(f"  OK    {item_id} -> {path}")
                success += 1
            else:
                print(f"  SKIP  {item_id} (not built)")
                skipped += 1
        except Exception as e:
            print(f"  FAIL  {item_id}: {e}")
            failed += 1

    print(f"\n{'='*50}")
    print(f"Published: {success}, Skipped: {skipped}, Failed: {failed}")


if __name__ == "__main__":
    main()
