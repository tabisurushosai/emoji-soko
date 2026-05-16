#!/usr/bin/env python3
"""Generate assets/icon.png (512x512). Requires: pip install Pillow"""

from __future__ import annotations

import math
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow is required: pip install Pillow", file=sys.stderr)
    sys.exit(1)

SIZE = 512
OUTPUT = Path(__file__).resolve().parent / "icon.png"

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


def draw_fallback_icons(draw: ImageDraw.ImageDraw, center_x: int, center_y: int) -> None:
    box_size = 120
    box_left = center_x - box_size - 24
    box_top = center_y - box_size // 2
    draw.rounded_rectangle(
        (box_left, box_top, box_left + box_size, box_top + box_size),
        radius=12,
        fill=(181, 101, 29),
        outline=(220, 150, 70),
        width=4,
    )
    draw.rectangle(
        (box_left + 24, box_top + 52, box_left + box_size - 24, box_top + 68),
        fill=(220, 150, 70),
    )

    star_size = 52
    star_cx = center_x + 24 + star_size
    star_cy = center_y
    points = []
    for i in range(10):
        angle = -90 + i * 36
        radius = star_size if i % 2 == 0 else star_size * 0.45
        rad = math.radians(angle)
        points.append(
            (
                star_cx + radius * math.cos(rad),
                star_cy + radius * math.sin(rad),
            )
        )
    draw.polygon(points, fill=(255, 215, 0), outline=(255, 240, 120))


def draw_emoji_icons(
    draw: ImageDraw.ImageDraw,
    emoji_font: ImageFont.FreeTypeFont,
    center_x: int,
    center_y: int,
) -> None:
    gap = 32
    emojis = ("📦", "⭐")
    widths = []
    for emoji in emojis:
        bbox = draw.textbbox((0, 0), emoji, font=emoji_font)
        widths.append(bbox[2] - bbox[0])

    total_width = widths[0] + gap + widths[1]
    x = center_x - total_width // 2
    y = center_y - (draw.textbbox((0, 0), emojis[0], font=emoji_font)[3] // 2)

    for emoji, width in zip(emojis, widths):
        bbox = draw.textbbox((0, 0), emoji, font=emoji_font)
        draw.text(
            (x - bbox[0], y - bbox[1]),
            emoji,
            font=emoji_font,
            embedded_color=True,
        )
        x += width + gap


def main() -> None:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    center_x = SIZE // 2
    emoji_center_y = 210
    emoji_font = load_emoji_font(160)

    if emoji_font is not None:
        draw_emoji_icons(draw, emoji_font, center_x, emoji_center_y)
    else:
        draw_fallback_icons(draw, center_x, emoji_center_y)

    title = "EMOJI SOKO"
    title_font = load_font(TITLE_FONT_CANDIDATES, 44)
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_x = (SIZE - (title_bbox[2] - title_bbox[0])) // 2
    title_y = 360
    draw.text((title_x, title_y), title, fill=(255, 255, 255), font=title_font)

    img.convert("RGB").save(OUTPUT)
    print(f"Saved {OUTPUT}")


if __name__ == "__main__":
    main()
