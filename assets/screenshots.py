#!/usr/bin/env python3
"""Generate screenshot assets (1280x800 x4). Requires: pip install Pillow"""

from __future__ import annotations

import math
import random
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow is required: pip install Pillow", file=sys.stderr)
    sys.exit(1)

WIDTH = 1280
HEIGHT = 800
ASSETS = Path(__file__).resolve().parent

EMOJI_FONT_CANDIDATES = [
    "/System/Library/Fonts/Apple Color Emoji.ttc",
    "/System/Library/Fonts/Supplemental/Apple Color Emoji.ttc",
    "C:/Windows/Fonts/seguiemj.ttf",
]

BOLD_FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]

REGULAR_FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial.ttf",
    "C:/Windows/Fonts/arial.ttf",
]

TITLE_MENU = ["PLAY", "CONTINUE", "STAGE SELECT", "SETTINGS", "HELP"]

CELL_EMOJI = {
    "W": "🟫",
    ".": None,
    "G": "⭐",
    "B": "📦",
    "P": "🧑",
    "$": "📦",
    "@": "🧑",
    "*": "⭐",
}

STAGE_PLAY = [
    "#######",
    "#..*..#",
    "#..$..#",
    "#..$..#",
    "#..@..#",
    "#..*..#",
    "#######",
]

MOCK_CLEARED = list(range(1, 43))
MOCK_BEST = {str(i): 8 + (i % 9) for i in MOCK_CLEARED}


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


def draw_centered_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x - tw // 2, y - th // 2), text, fill=fill, font=font)


def draw_emoji_centered(
    draw: ImageDraw.ImageDraw,
    emoji: str,
    cx: int,
    cy: int,
    emoji_font: ImageFont.FreeTypeFont | None,
    fallback_size: int = 24,
) -> None:
    if emoji_font is not None:
        bbox = draw.textbbox((0, 0), emoji, font=emoji_font)
        tx = cx - (bbox[0] + bbox[2]) // 2
        ty = cy - (bbox[1] + bbox[3]) // 2
        draw.text((tx, ty), emoji, font=emoji_font, embedded_color=True)
    else:
        draw.text((cx, cy), emoji, fill=(255, 255, 255), anchor="mm", font=load_font(REGULAR_FONT_CANDIDATES, fallback_size))


def draw_progress_label(draw: ImageDraw.ImageDraw, cleared: int, y: int) -> None:
    font = load_font(REGULAR_FONT_CANDIDATES, 22)
    draw_centered_text(draw, f"{cleared} / 100 ステージクリア", WIDTH // 2, y, font, (170, 170, 170))


def draw_stage_grid(
    base: Image.Image,
    stage_rows: list[str],
    cell_size: int = 64,
    emoji_size: int = 40,
) -> tuple[int, int, int, int]:
    draw = ImageDraw.Draw(base)
    emoji_font = load_emoji_font(emoji_size)
    rows = len(stage_rows)
    cols = len(stage_rows[0])
    grid_w = cols * cell_size
    grid_h = rows * cell_size
    origin_x = (WIDTH - grid_w) // 2
    origin_y = (HEIGHT - grid_h) // 2 + 20

    for x in range(cols + 1):
        px = origin_x + x * cell_size
        draw.line((px, origin_y, px, origin_y + grid_h), fill=(34, 34, 34), width=1)

    for y in range(rows + 1):
        py = origin_y + y * cell_size
        draw.line((origin_x, py, origin_x + grid_w, py), fill=(34, 34, 34), width=1)

    for y, row in enumerate(stage_rows):
        for x, ch in enumerate(row):
            emoji = CELL_EMOJI.get(ch)
            if not emoji:
                continue
            cx = origin_x + x * cell_size + cell_size // 2
            cy = origin_y + y * cell_size + cell_size // 2
            draw_emoji_centered(draw, emoji, cx, cy, emoji_font)

    return origin_x, origin_y, grid_w, grid_h


def draw_move_hud(draw: ImageDraw.ImageDraw, stage_num: int, moves: int, best: int) -> None:
    font = load_font(REGULAR_FONT_CANDIDATES, 22)
    label = f"STAGE {stage_num:02d}  手数: {moves}  BEST: {best}"
    bbox = draw.textbbox((0, 0), label, font=font)
    draw.text((WIDTH - bbox[2] - 20, 16), label, fill=(255, 255, 255), font=font)


def screenshot_title() -> Image.Image:
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    title_font = load_font(BOLD_FONT_CANDIDATES, 72)
    subtitle_font = load_font(REGULAR_FONT_CANDIDATES, 32)
    draw_centered_text(draw, "EMOJI SOKO", WIDTH // 2, 160, title_font, (255, 255, 255))
    draw_centered_text(draw, "絵文字の蔵", WIDTH // 2, 230, subtitle_font, (255, 255, 255))
    draw_progress_label(draw, len(MOCK_CLEARED), 290)

    start_y = 380
    line_height = 56
    for index, label in enumerate(TITLE_MENU):
        selected = index == 0
        font = load_font(BOLD_FONT_CANDIDATES if selected else REGULAR_FONT_CANDIDATES, 32 if selected else 28)
        color = (255, 255, 255) if selected else (136, 136, 136)
        prefix = "▶ " if selected else "   "
        draw_centered_text(draw, f"{prefix}{label}", WIDTH // 2, start_y + index * line_height, font, color)

    return img


def screenshot_gameplay() -> Image.Image:
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
    draw_stage_grid(img, STAGE_PLAY, cell_size=72, emoji_size=40)
    draw = ImageDraw.Draw(img)
    draw_move_hud(draw, 5, 12, 10)
    return img


def screenshot_clear() -> Image.Image:
    img = screenshot_gameplay()
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    fade = 0.85
    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(0, 0, 0, int(255 * 0.55 * fade)))
    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(255, 215, 0, int(255 * 0.12)))

    random.seed(42)
    emoji_font = load_emoji_font(40)
    for _ in range(28):
        x = WIDTH // 2 + random.uniform(-220, 220)
        y = HEIGHT // 2 + random.uniform(-140, 140)
        size = random.uniform(16, 36)
        phase = random.uniform(0, math.tau)
        offset = math.sin(phase) * 8
        alpha = int(255 * fade * 0.8)
        if emoji_font is not None:
            font = load_emoji_font(max(20, int(size)))
            if font is None:
                font = emoji_font
            bbox = draw.textbbox((0, 0), "⭐", font=font)
            tx = x - (bbox[0] + bbox[2]) // 2
            ty = y + offset - (bbox[1] + bbox[3]) // 2
            draw.text((tx, ty), "⭐", font=font, embedded_color=True, fill=(255, 255, 255, alpha))
        else:
            draw.text((x, y + offset), "⭐", fill=(255, 255, 255, alpha))

    title_font = load_font(BOLD_FONT_CANDIDATES, 64)
    best_font = load_font(BOLD_FONT_CANDIDATES, 34)
    emoji_celebrate = load_emoji_font(40)

    draw_centered_text(draw, "STAGE CLEAR", WIDTH // 2, HEIGHT // 2, title_font, (255, 255, 255))
    draw_centered_text(draw, "NEW BEST!", WIDTH // 2, HEIGHT // 2 + 52, best_font, (255, 215, 0))
    draw_emoji_centered(draw, "🎉", WIDTH // 2, HEIGHT // 2 + 98, emoji_celebrate)

    return Image.alpha_composite(img, overlay)


def screenshot_stage_select() -> Image.Image:
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    draw_progress_label(draw, len(MOCK_CLEARED), 34)

    cols = 10
    rows = 10
    cell_size = min(WIDTH // cols, (HEIGHT - 48) // rows)
    grid_w = cell_size * cols
    grid_h = cell_size * rows
    origin_x = (WIDTH - grid_w) // 2
    origin_y = (HEIGHT - grid_h) // 2 + 16
    emoji_font = load_emoji_font(40)

    for stage_num in range(1, 101):
        index = stage_num - 1
        col = index % cols
        row = index // cols
        x = origin_x + col * cell_size
        y = origin_y + row * cell_size
        cx = x + cell_size // 2
        cy = y + cell_size // 2

        draw.rectangle((x, y, x + cell_size, y + cell_size), outline=(51, 51, 51), width=1)

        if stage_num in MOCK_CLEARED:
            best = MOCK_BEST[str(stage_num)]
            font = load_font(BOLD_FONT_CANDIDATES, max(12, int(cell_size * 0.22)))
            draw_centered_text(draw, f"✓ {best}手", cx, cy, font, (255, 255, 255))
        elif stage_num <= 43:
            font = load_font(BOLD_FONT_CANDIDATES, max(14, int(cell_size * 0.32)))
            draw_centered_text(draw, str(stage_num), cx, cy, font, (255, 255, 255))
        else:
            draw_emoji_centered(draw, "🔒", cx, cy, emoji_font, max(12, int(cell_size * 0.3)))

    return img


def main() -> None:
    shots = [
        ("screenshot_1.png", screenshot_title),
        ("screenshot_2.png", screenshot_gameplay),
        ("screenshot_3.png", screenshot_clear),
        ("screenshot_4.png", screenshot_stage_select),
    ]

    for filename, builder in shots:
        output = ASSETS / filename
        builder().convert("RGB").save(output)
        print(f"Saved {output}")


if __name__ == "__main__":
    main()
