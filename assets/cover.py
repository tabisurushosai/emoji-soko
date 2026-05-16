#!/usr/bin/env python3
"""Generate assets/cover.png (1080x540). Requires: pip install Pillow"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow is required: pip install Pillow", file=sys.stderr)
    sys.exit(1)

WIDTH = 1080
HEIGHT = 540
OUTPUT = Path(__file__).resolve().parent / "cover.png"

EMOJI_FONT_CANDIDATES = [
    "/System/Library/Fonts/Apple Color Emoji.ttc",
    "/System/Library/Fonts/Supplemental/Apple Color Emoji.ttc",
    "C:/Windows/Fonts/seguiemj.ttf",
]

TITLE_FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]

SUBTITLE_FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial.ttf",
    "C:/Windows/Fonts/arial.ttf",
]

CELL_EMOJI = {
    "WALL": "🟫",
    "FLOOR": None,
    "GOAL": "⭐",
    "BOX": "📦",
    "PLAYER": "🧑",
    "BOX_ON_GOAL": "🎁",
    "PLAYER_ON_GOAL": "🧑",
}

SAMPLE_STAGE = [
    "WWWWWWW",
    "W..G..W",
    "W.PB.GW",
    "W..B..W",
    "W..G..W",
    "WWWWWWW",
]

TYPE_FROM_CHAR = {
    "W": "WALL",
    ".": "FLOOR",
    "G": "GOAL",
    "B": "BOX",
    "P": "PLAYER",
}


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def load_emoji_font(size: int) -> ImageFont.FreeTypeFont | None:
    for path in EMOJI_FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return None


def draw_logo(draw: ImageDraw.ImageDraw) -> None:
    title_font = load_font(TITLE_FONT_CANDIDATES, 72)
    subtitle_font = load_font(SUBTITLE_FONT_CANDIDATES, 32)

    title = "EMOJI SOKO"
    subtitle = "絵文字の蔵"

    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)

    title_x = 72
    title_y = HEIGHT // 2 - (title_bbox[3] - title_bbox[1]) // 2 - 28
    subtitle_y = title_y + (title_bbox[3] - title_bbox[1]) + 16

    draw.text((title_x, title_y), title, fill=(255, 255, 255), font=title_font)
    draw.text((title_x, subtitle_y), subtitle, fill=(170, 170, 170), font=subtitle_font)


def draw_stage_grid(draw: ImageDraw.ImageDraw, emoji_font: ImageFont.FreeTypeFont | None) -> None:
    cell_size = 56
    rows = len(SAMPLE_STAGE)
    cols = len(SAMPLE_STAGE[0])
    grid_w = cols * cell_size
    grid_h = rows * cell_size

    origin_x = WIDTH - grid_w - 80
    origin_y = (HEIGHT - grid_h) // 2

    draw.rectangle(
        (origin_x - 12, origin_y - 12, origin_x + grid_w + 12, origin_y + grid_h + 12),
        outline=(34, 34, 34),
        width=2,
    )

    for x in range(cols + 1):
        px = origin_x + x * cell_size
        draw.line((px, origin_y, px, origin_y + grid_h), fill=(34, 34, 34), width=1)

    for y in range(rows + 1):
        py = origin_y + y * cell_size
        draw.line((origin_x, py, origin_x + grid_w, py), fill=(34, 34, 34), width=1)

    for y, row in enumerate(SAMPLE_STAGE):
        for x, ch in enumerate(row):
            cell_type = TYPE_FROM_CHAR[ch]
            emoji = CELL_EMOJI[cell_type]
            if not emoji:
                continue

            cx = origin_x + x * cell_size + cell_size // 2
            cy = origin_y + y * cell_size + cell_size // 2

            if emoji_font is not None:
                bbox = draw.textbbox((0, 0), emoji, font=emoji_font)
                tx = cx - (bbox[0] + bbox[2]) // 2
                ty = cy - (bbox[1] + bbox[3]) // 2
                draw.text((tx, ty), emoji, font=emoji_font, embedded_color=True)
            else:
                draw.text((cx, cy), emoji, fill=(255, 255, 255), anchor="mm")


def main() -> None:
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    draw_logo(draw)
    draw_stage_grid(draw, load_emoji_font(40))

    img.convert("RGB").save(OUTPUT)
    print(f"Saved {OUTPUT}")


if __name__ == "__main__":
    main()
