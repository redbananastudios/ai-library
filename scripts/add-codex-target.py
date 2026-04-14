#!/usr/bin/env python3
"""One-off migration: add 'codex' to compatible_targets in every spec.yaml.

Idempotent — skips files that already list ``codex``. Runs a text-level
rewrite rather than a YAML round-trip so the existing formatting (inline list
vs block list, quoting style) is preserved.
"""

import re
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import ROOT, SKILLS_DIR, AGENTS_DIR, log, read_text, write_text


# Matches: compatible_targets: [ ... ]   (inline list)
INLINE_RE = re.compile(
    r"^(?P<prefix>compatible_targets:\s*)\[(?P<body>[^\]\n]*)\]\s*$",
    re.MULTILINE,
)


def update_inline(match: re.Match) -> str:
    body = match.group("body")
    if "codex" in body:
        return match.group(0)
    items = [x.strip() for x in body.split(",") if x.strip()]
    items.append("'codex'")
    return f"{match.group('prefix')}[{', '.join(items)}]"


def process_block_list(lines: list[str]) -> tuple[list[str], bool]:
    """For a file using the YAML block list format, append '- codex' if missing.

    Returns (new_lines, modified).
    """
    out: list[str] = []
    modified = False
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        out.append(line)
        if line.strip() == "compatible_targets:":
            # Gather subsequent '- item' lines
            j = i + 1
            block: list[int] = []
            already = False
            while j < n and lines[j].lstrip().startswith("- "):
                item = lines[j].lstrip()[2:].strip().strip("'\"")
                block.append(j)
                if item == "codex":
                    already = True
                j += 1
            # Copy the block
            for k in range(i + 1, j):
                out.append(lines[k])
            if block and not already:
                # Match indentation of the existing items.
                sample = lines[block[0]]
                indent = sample[: len(sample) - len(sample.lstrip())]
                # Determine line-ending style from an existing item line.
                eol = "\n"
                if sample.endswith("\r\n"):
                    eol = "\r\n"
                # Ensure the previous line in out ends with a newline before
                # we append our new item (otherwise we'll concatenate onto it).
                if out and not out[-1].endswith(("\n", "\r\n")):
                    out[-1] = out[-1] + eol
                out.append(f"{indent}- codex{eol}")
                modified = True
            i = j
            continue
        i += 1
    return out, modified


def migrate(path: Path) -> bool:
    text = read_text(path)
    original = text

    # Inline form.
    new_text, n_inline = INLINE_RE.subn(update_inline, text)
    if n_inline:
        text = new_text

    # Block form (only if the inline substitution did not fire).
    if text == original or n_inline == 0:
        lines = text.splitlines(keepends=True)
        new_lines, modified = process_block_list(lines)
        if modified:
            text = "".join(new_lines)

    if text != original:
        write_text(path, text)
        return True
    return False


def main():
    updated = 0
    skipped = 0
    for root_dir in (SKILLS_DIR, AGENTS_DIR):
        if not root_dir.exists():
            continue
        for spec in sorted(root_dir.glob("*/spec.yaml")):
            try:
                changed = migrate(spec)
            except Exception as e:
                log(f"Failed to migrate {spec}: {e}", "ERROR")
                continue
            if changed:
                updated += 1
                print(f"  UPDATED  {spec.relative_to(ROOT)}")
            else:
                skipped += 1
    print(f"\nSummary: {updated} updated, {skipped} already had codex or had no compatible_targets field.")


if __name__ == "__main__":
    main()
