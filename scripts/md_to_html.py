#!/usr/bin/env python3
"""Convert legal/*.md to legal/*.html (stdlib only)."""

from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEGAL_DIR = ROOT / "legal"

FOOTER_LINKS = [
    ("PRIVACY.html", "Privacy"),
    ("TERMS.html", "Terms"),
    ("LICENSES.html", "Licenses"),
]


def inline_format(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(
        r"(https?://[^\s<]+)",
        r'<a href="\1" target="_blank" rel="noopener">\1</a>',
        text,
    )
    return text


def parse_table_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def is_table_separator(line: str) -> bool:
    cells = parse_table_row(line)
    return bool(cells) and all(re.fullmatch(r":?-+:?", c) for c in cells)


def markdown_to_html(md: str) -> str:
    lines = md.splitlines()
    out: list[str] = []
    i = 0

    while i < len(lines):
        line = lines[i]

        if line.strip() == "---":
            out.append("<hr>")
            i += 1
            continue

        if line.startswith("```"):
            fence = line.strip()
            i += 1
            code_lines = []
            while i < len(lines) and not lines[i].startswith("```"):
                code_lines.append(lines[i])
                i += 1
            if i < len(lines):
                i += 1
            out.append("<pre><code>" + html.escape("\n".join(code_lines)) + "</code></pre>")
            continue

        m = re.match(r"^(#{1,4})\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            out.append(f"<h{level}>{inline_format(m.group(2))}</h{level}>")
            i += 1
            continue

        if "|" in line and i + 1 < len(lines) and is_table_separator(lines[i + 1]):
            headers = parse_table_row(line)
            i += 2
            rows = []
            while i < len(lines) and "|" in lines[i] and lines[i].strip():
                rows.append(parse_table_row(lines[i]))
                i += 1
            out.append("<table>")
            out.append("<thead><tr>" + "".join(f"<th>{inline_format(h)}</th>" for h in headers) + "</tr></thead>")
            out.append("<tbody>")
            for row in rows:
                out.append("<tr>" + "".join(f"<td>{inline_format(c)}</td>" for c in row) + "</tr>")
            out.append("</tbody></table>")
            continue

        if line.startswith("- "):
            out.append("<ul>")
            while i < len(lines) and lines[i].startswith("- "):
                out.append(f"<li>{inline_format(lines[i][2:])}</li>")
                i += 1
            out.append("</ul>")
            continue

        if not line.strip():
            i += 1
            continue

        out.append(f"<p>{inline_format(line)}</p>")
        i += 1

    return "\n".join(out)


def page_title(md_path: Path, md_text: str) -> str:
    first = md_text.splitlines()[0].lstrip("# ").strip()
    return f"{first} — EMOJI SOKO"


def build_footer_nav(current: str) -> str:
    parts = []
    for href, label in FOOTER_LINKS:
        if href == current:
            parts.append(f"<span class=\"current\">{label}</span>")
        else:
            parts.append(f'<a href="{href}">{label}</a>')
    return " · ".join(parts)


def wrap_page(title: str, body_html: str, current_file: str) -> str:
    nav = build_footer_nav(current_file)
    return f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(title)}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="legal-doc">
    <nav class="legal-nav">
      <a href="../index.html">← EMOJI SOKO</a>
    </nav>
    <article>
{body_html}
    </article>
    <footer class="legal-footer">
      {nav}
    </footer>
  </main>
</body>
</html>
"""


def convert_file(md_path: Path) -> Path:
    md_text = md_path.read_text(encoding="utf-8")
    body = markdown_to_html(md_text)
    indented = "\n".join("      " + ln if ln else "" for ln in body.splitlines())
    html_name = md_path.with_suffix(".html").name
    page = wrap_page(page_title(md_path, md_text), indented, html_name)
    out_path = md_path.with_suffix(".html")
    out_path.write_text(page, encoding="utf-8")
    return out_path


def main() -> None:
    for md_path in sorted(LEGAL_DIR.glob("*.md")):
        out = convert_file(md_path)
        print(f"Wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
