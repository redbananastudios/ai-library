#!/usr/bin/env python3
"""Build a single skill for Claude, Paperclip and Codex targets."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    if len(sys.argv) < 2:
        print("Usage: python build-skill.py <skill-id>")
        sys.exit(1)

    skill_id = sys.argv[1]
    item_dir = SKILLS_DIR / skill_id

    if not item_dir.exists():
        print(f"Skill not found: {skill_id}")
        sys.exit(1)

    spec = load_spec(item_dir)
    targets = spec.get("compatible_targets", ["claude", "paperclip", "codex"])
    if isinstance(targets, str):
        targets = [t.strip() for t in targets.split(",")]

    if "claude" in targets:
        build_claude_skill(item_dir)
    if "paperclip" in targets:
        build_paperclip_item(item_dir)
    if "codex" in targets:
        build_codex_skill(item_dir)

    log(f"Build complete for skill: {skill_id}")


if __name__ == "__main__":
    main()
