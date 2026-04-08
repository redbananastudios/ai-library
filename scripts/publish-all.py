#!/usr/bin/env python3
"""Publish all items to both Claude and Paperclip targets."""

import sys
import subprocess
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


def main():
    print("=" * 50)
    print("PUBLISH ALL - Claude + Paperclip")
    print("=" * 50)

    scripts = Path(__file__).parent

    print("\n--- Publishing to Claude ---\n")
    subprocess.run([sys.executable, str(scripts / "publish-claude.py")], check=False)

    print("\n--- Publishing to Paperclip ---\n")
    subprocess.run([sys.executable, str(scripts / "publish-paperclip.py")], check=False)

    print("\n" + "=" * 50)
    print("Publish all complete.")
    print("Run `python scripts/status.py` for full status.")


if __name__ == "__main__":
    main()
