#!/usr/bin/env python3
"""Publish a single item to Claude, Paperclip and/or Codex targets."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    if len(sys.argv) < 2:
        print("Usage: python publish-item.py <item-id> [--target=claude|paperclip|codex|both|all]")
        sys.exit(1)

    item_id = sys.argv[1]
    target = "all"
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
    published_codex = ""

    # "both" kept for backwards-compat — means claude + paperclip.
    claude_requested = target in ("claude", "both", "all")
    paperclip_requested = target in ("paperclip", "both", "all")
    codex_requested = target in ("codex", "all")

    if claude_requested:
        ok = publish_to_claude(item_id, item_type)
        if ok:
            if item_type in ("agent", "subagent"):
                published_claude = str((CLAUDE_AGENTS_TARGET / f"{item_id}.md").as_posix())
            else:
                published_claude = str((CLAUDE_SKILLS_TARGET / item_id).as_posix())
            print(f"  Published to Claude: {published_claude}")
        else:
            print(f"  FAILED to publish to Claude")

    if paperclip_requested:
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

    if codex_requested:
        ok = publish_to_codex(item_id, item_type)
        if ok:
            if item_type in ("agent", "subagent"):
                published_codex = str((CODEX_AGENTS_TARGET / f"{item_id}.toml").as_posix())
            else:
                published_codex = str((CODEX_SKILLS_TARGET / item_id).as_posix())
            print(f"  Published to Codex: {published_codex}")
        else:
            print(f"  FAILED to publish to Codex (or codex not built for {item_id})")

    # Update registry with only the fields we actually touched so we don't
    # clobber unrelated ones.
    registry_update = {"id": item_id}
    if claude_requested:
        registry_update["published_claude_path"] = published_claude
    if paperclip_requested:
        registry_update["published_paperclip_status"] = published_paperclip
    if codex_requested:
        registry_update["published_codex_path"] = published_codex
    upsert_registry(registry_update)


if __name__ == "__main__":
    main()
