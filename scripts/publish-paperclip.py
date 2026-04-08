#!/usr/bin/env python3
"""Generate Paperclip publish manifests for all built items."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    items = get_all_items()
    if not items:
        print("No items found.")
        sys.exit(1)

    print(f"Generating Paperclip manifests for {len(items)} items...\n")
    success = 0

    for item_id, item_type, item_dir in items:
        if item_type in ("agent", "subagent"):
            payload_path = GEN_PAPERCLIP_AGENTS / item_id / "payload.json"
        else:
            payload_path = GEN_PAPERCLIP_SKILLS / item_id / "payload.json"

        if payload_path.exists():
            manifest = {
                "item_id": item_id,
                "type": item_type,
                "payload_path": str(payload_path.relative_to(ROOT)),
                "published_at": datetime.datetime.now().isoformat(),
                "instructions": "Import payload.json into Paperclip via API or dashboard.",
            }
            manifest_path = MANIFESTS_DIR / f"{item_id}-paperclip-manifest.json"
            write_json(manifest_path, manifest)
            upsert_registry({"id": item_id, "published_paperclip_status": "manifest_generated"})
            print(f"  OK    {item_id}")
            success += 1
        else:
            print(f"  SKIP  {item_id} (no payload)")

    # Write combined import guide
    guide = [
        "# Paperclip Import Guide\n",
        f"Generated: {datetime.datetime.now().isoformat()}\n",
        "## Steps\n",
        "1. Open Paperclip dashboard or API endpoint",
        "2. For each item below, import the payload.json file",
        "3. Verify the item appears in your Paperclip workspace\n",
        "## Items\n",
    ]
    for item_id, item_type, _ in items:
        if item_type in ("agent", "subagent"):
            pp = GEN_PAPERCLIP_AGENTS / item_id / "payload.json"
        else:
            pp = GEN_PAPERCLIP_SKILLS / item_id / "payload.json"
        if pp.exists():
            guide.append(f"- **{item_id}** ({item_type}): `{pp.relative_to(ROOT)}`")

    write_text(MANIFESTS_DIR / "paperclip-import-guide.md", "\n".join(guide) + "\n")
    print(f"\n{'='*50}")
    print(f"Manifests generated: {success}")
    print(f"Import guide: build/manifests/paperclip-import-guide.md")


if __name__ == "__main__":
    main()
