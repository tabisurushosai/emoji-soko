#!/usr/bin/env python3
"""Replace half-width spaces with floor (.) in stages/*.txt."""

import argparse
from pathlib import Path


def normalize_line(line: str) -> str:
    return line.replace(" ", ".")


def normalize_file(path: Path, apply: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    normalized = "\n".join(normalize_line(line) for line in text.splitlines())
    if text.endswith("\n") and not normalized.endswith("\n"):
        normalized += "\n"
    if normalized == text:
        return False
    if apply:
        path.write_text(normalized, encoding="utf-8")
    return True


def main():
    parser = argparse.ArgumentParser(description="Normalize stage files (space → .)")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write changes (default: dry-run)",
    )
    parser.add_argument(
        "stage_dir",
        nargs="?",
        default="stages",
        help="Stage directory (default: stages)",
    )
    args = parser.parse_args()
    stage_dir = Path(args.stage_dir)
    changed = []
    for path in sorted(stage_dir.glob("*.txt")):
        if " " in path.read_text(encoding="utf-8"):
            if normalize_file(path, args.apply):
                changed.append(path.name)
            elif not args.apply:
                changed.append(path.name)
    if not changed:
        print("OK: no half-width spaces found")
        return
    mode = "updated" if args.apply else "would update"
    print(f"{mode}: {', '.join(changed)}")
    if not args.apply:
        print("Re-run with --apply to write")


if __name__ == "__main__":
    main()
