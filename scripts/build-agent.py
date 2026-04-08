#!/usr/bin/env python3
"""Build a single agent for both Claude and Paperclip targets."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    if len(sys.argv) < 2:
        print("Usage: python build-agent.py <agent-id>")
        sys.exit(1)

    agent_id = sys.argv[1]
    item_dir = AGENTS_DIR / agent_id

    if not item_dir.exists():
        print(f"Agent not found: {agent_id}")
        sys.exit(1)

    spec = load_spec(item_dir)
    targets = spec.get("compatible_targets", ["claude", "paperclip"])
    if isinstance(targets, str):
        targets = [t.strip() for t in targets.split(",")]

    if "claude" in targets:
        build_claude_agent(item_dir)
    if "paperclip" in targets:
        build_paperclip_item(item_dir)

    log(f"Build complete for agent: {agent_id}")


if __name__ == "__main__":
    main()
