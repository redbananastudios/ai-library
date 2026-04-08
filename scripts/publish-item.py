#!/usr/bin/env python3
"""Publish a single item to Claude and/or Paperclip targets."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    if len(sys.argv) < 2:
        print("Usage: python publish-item.py <item-id> [--target=claude|paperclip|both]")
        sys.exit(1)

    item_id = sys.argv[1]
    target = "both"
    for arg in sys.argv[2:]:
        if arg.startswith("--target="):
            target = arg.split("=", 1)[1]

    # Find item
    item_dir = SKILLS_DIR / item_id
    item_type = "skill"
    if not item_dir.exists():
        item_dir = AGENTS_DIR / item_id
        item_type = "agent"
    if not item_dir.exists():
        print(f"Item not found: {item_id}")
        sys.exit(1)

    spec = load_spec(item_dir)
    item_type = spec.get("type", item_type)

    published_claude = ""
    published_paperclip = "not_published"

    if target in ("claude", "both"):
        ok = publish_to_claude(item_id, item_type)
        if ok:
            if item_type in ("agent", "subagent"):
                published_claude = str((CLAUDE_AGENTS_TARGET / f"{item_id}.md").relative_to(PROJECT_ROOT))
            else:
                published_claude = str((CLAUDE_SKILLS_TARGET / item_id).relative_to(PROJECT_ROOT))
            print(f"  Published to Claude: {published_claude}")
        else:
            print(f"  FAILED to publish to Claude")

    if target in ("paperclip", "both"):
        # Paperclip: generate manifest for manual import
        if item_type in ("agent", "subagent"):
            payload_path = GEN_PAPERCLIP_AGENTS / item_id / "payload.json"
        else:
            payload_path = GEN_PAPERCLIP_SKILLS / item_id / "payload.json"

        if payload_path.exists():
            manifest = {
                "item_id": item_id,
                "type": item_type,
                "payload_path": str(payload_path),
                "published_at": datetime.datetime.now().isoformat(),
                "instructions": "Import payload.json into Paperclip via API or dashboard.",
            }
            manifest_path = MANIFESTS_DIR / f"{item_id}-paperclip-manifest.json"
            write_json(manifest_path, manifest)
            published_paperclip = "manifest_generated"
            print(f"  Paperclip manifest: {manifest_path}")
        else:
            print(f"  Paperclip payload not built for {item_id}")

    # Update registry
    upsert_registry({
        "id": item_id,
        "published_claude_path": published_claude,
        "published_paperclip_status": published_paperclip,
    })


if __name__ == "__main__":
    main()
