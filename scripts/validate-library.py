#!/usr/bin/env python3
"""Validate all items in the ai-library source of truth."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *

def validate_item(item_dir: Path) -> list[str]:
    errors = []
    spec_path = item_dir / "spec.yaml"
    if not spec_path.exists():
        errors.append(f"Missing spec.yaml in {item_dir}")
        return errors

    spec = load_spec(item_dir)
    required = ["id", "name", "type", "version", "status"]
    for field in required:
        if not spec.get(field):
            errors.append(f"Missing required field '{field}' in {spec_path}")

    prompt_path = item_dir / "prompt.md"
    if not prompt_path.exists():
        errors.append(f"Missing prompt.md in {item_dir}")
    elif prompt_path.stat().st_size < 10:
        errors.append(f"prompt.md is nearly empty in {item_dir}")

    source_path = item_dir / "source.json"
    if not source_path.exists():
        errors.append(f"Missing source.json in {item_dir}")

    return errors


def main():
    all_errors = []
    items = get_all_items()

    if not items:
        print("No items found in library.")
        sys.exit(1)

    print(f"Validating {len(items)} items...\n")

    for item_id, item_type, item_dir in items:
        errors = validate_item(item_dir)
        if errors:
            print(f"  FAIL  {item_id}")
            for e in errors:
                print(f"        - {e}")
            all_errors.extend(errors)
        else:
            print(f"  OK    {item_id}")

    print(f"\n{'='*50}")
    if all_errors:
        print(f"FAILED: {len(all_errors)} errors in {len(items)} items")
        sys.exit(1)
    else:
        print(f"PASSED: {len(items)} items validated")


if __name__ == "__main__":
    main()
