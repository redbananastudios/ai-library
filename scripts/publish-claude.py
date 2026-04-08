#!/usr/bin/env python3
"""Publish all built items to Claude (.claude/skills/ and .claude/agents/)."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    items = get_all_items()
    if not items:
        print("No items found.")
        sys.exit(1)

    print(f"Publishing {len(items)} items to Claude...\n")
    success = 0
    failed = 0

    for item_id, item_type, item_dir in items:
        try:
            ok = publish_to_claude(item_id, item_type)
            if ok:
                path = ""
                if item_type in ("agent", "subagent"):
                    path = str((CLAUDE_AGENTS_TARGET / f"{item_id}.md").relative_to(PROJECT_ROOT))
                else:
                    path = str((CLAUDE_SKILLS_TARGET / item_id).relative_to(PROJECT_ROOT))
                upsert_registry({"id": item_id, "published_claude_path": path})
                print(f"  OK    {item_id} -> {path}")
                success += 1
            else:
                print(f"  SKIP  {item_id} (not built)")
                failed += 1
        except Exception as e:
            print(f"  FAIL  {item_id}: {e}")
            failed += 1

    print(f"\n{'='*50}")
    print(f"Published: {success}, Skipped/Failed: {failed}")


if __name__ == "__main__":
    main()
