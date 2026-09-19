"""
One-time script that procedurally paints the "product background" library
shipped with the app (backend/app/static/backgrounds/*.png) plus matching
thumbnails. Re-run it any time you want to regenerate or tweak the set —
no external assets or internet access required.

Usage:
    python backend/scripts/generate_backgrounds.py
"""

import os
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
BG_DIR = os.path.normpath(os.path.join(HERE, "..", "app", "static", "backgrounds"))
THUMB_DIR = os.path.normpath(os.path.join(HERE, "..", "app", "static", "thumbnails"))
SIZE = (1600, 1600)
THUMB_SIZE = (320, 320)

os.makedirs(BG_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)


def linear_gradient(size, top, bottom):
    w, h = size
    base = np.linspace(0, 1, h).reshape(h, 1)
    top_arr, bottom_arr = np.array(top), np.array(bottom)
    grad = (top_arr * (1 - base) + bottom_arr * base).astype(np.uint8)
    grad = np.repeat(grad[:, np.newaxis, :], w, axis=1)
    return Image.fromarray(grad, "RGB")


def radial_vignette(size, inner, outer, center=None, radius_scale=0.9):
    w, h = size
    cx, cy = center or (w / 2, h / 2)
    yy, xx = np.mgrid[0:h, 0:w]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    max_r = radius_scale * np.sqrt((w / 2) ** 2 + (h / 2) ** 2)
    t = np.clip(dist / max_r, 0, 1)[:, :, np.newaxis]
    inner_arr, outer_arr = np.array(inner), np.array(outer)
    grad = (inner_arr * (1 - t) + outer_arr * t).astype(np.uint8)
    return Image.fromarray(grad, "RGB")


def add_noise(img, amount=6):
    arr = np.array(img).astype(np.int16)
    noise = np.random.randint(-amount, amount + 1, arr.shape[:2] + (1,))
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGB")


def studio_floor_shadow(img, floor_y_ratio=0.78):
    """Add a subtle horizon line + soft shadow ellipse to fake a studio floor."""
    w, h = img.size
    draw_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(draw_layer)
    floor_y = int(h * floor_y_ratio)
    ellipse_w, ellipse_h = int(w * 0.6), int(h * 0.06)
    draw.ellipse(
        [w / 2 - ellipse_w / 2, floor_y - ellipse_h / 2, w / 2 + ellipse_w / 2, floor_y + ellipse_h / 2],
        fill=(0, 0, 0, 60),
    )
    draw_layer = draw_layer.filter(ImageFilter.GaussianBlur(30))
    out = img.convert("RGBA")
    out.alpha_composite(draw_layer)
    return out.convert("RGB")


def make(name, builder):
    img = builder()
    img = img.resize(SIZE, Image.LANCZOS) if img.size != SIZE else img
    img.save(os.path.join(BG_DIR, f"{name}.png"), optimize=True)
    thumb = img.copy()
    thumb.thumbnail(THUMB_SIZE, Image.LANCZOS)
    thumb.save(os.path.join(THUMB_DIR, f"{name}.png"), optimize=True)
    print(f"  generated {name}")


def build_studio_white():
    img = linear_gradient(SIZE, (255, 255, 255), (235, 235, 238))
    return studio_floor_shadow(img)


def build_studio_black():
    img = linear_gradient(SIZE, (40, 40, 44), (10, 10, 12))
    return add_noise(img, 3)


def build_studio_gray():
    return radial_vignette(SIZE, (210, 210, 214), (140, 140, 148))


def build_soft_pink():
    return radial_vignette(SIZE, (255, 226, 233), (250, 190, 205))


def build_soft_blue():
    return radial_vignette(SIZE, (223, 240, 255), (176, 214, 250))


def build_warm_sunset():
    img = linear_gradient(SIZE, (255, 183, 120), (255, 94, 98))
    return add_noise(img, 4)


def build_mint_fresh():
    return radial_vignette(SIZE, (223, 250, 240), (167, 224, 200))


def build_spotlight_dark():
    return radial_vignette(SIZE, (70, 70, 80), (8, 8, 10), radius_scale=0.75)


def build_marble():
    base = np.full((*SIZE[::-1], 3), 235, dtype=np.uint8)
    rng = np.random.default_rng(7)
    img = Image.fromarray(base, "RGB")
    draw = ImageDraw.Draw(img)
    for _ in range(14):
        x0 = rng.integers(0, SIZE[0])
        y0 = 0
        pts = [(x0, y0)]
        x, y = x0, y0
        while y < SIZE[1]:
            x += rng.integers(-40, 40)
            y += rng.integers(20, 60)
            pts.append((x, y))
        draw.line(pts, fill=(200, 198, 195), width=rng.integers(1, 4))
    img = img.filter(ImageFilter.GaussianBlur(2))
    return img


def build_wood_desk():
    w, h = SIZE
    base = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        shade = 90 + int(25 * np.sin(y / 14.0)) + int(10 * np.sin(y / 3.3))
        base[y, :, 0] = np.clip(shade + 20, 0, 255)
        base[y, :, 1] = np.clip(shade - 10, 0, 255)
        base[y, :, 2] = np.clip(shade - 40, 0, 255)
    img = Image.fromarray(base, "RGB")
    return add_noise(img, 8)


def build_paper_texture():
    img = linear_gradient(SIZE, (222, 197, 156), (196, 165, 122))
    return add_noise(img, 10)


def build_purple_glow():
    return radial_vignette(SIZE, (159, 122, 255), (40, 20, 90))


BUILDERS = {
    "studio-white": build_studio_white,
    "studio-black": build_studio_black,
    "studio-gray": build_studio_gray,
    "soft-pink": build_soft_pink,
    "soft-blue": build_soft_blue,
    "warm-sunset": build_warm_sunset,
    "mint-fresh": build_mint_fresh,
    "spotlight-dark": build_spotlight_dark,
    "marble": build_marble,
    "wood-desk": build_wood_desk,
    "paper-texture": build_paper_texture,
    "purple-glow": build_purple_glow,
}


if __name__ == "__main__":
    print("Generating background library...")
    for name, fn in BUILDERS.items():
        make(name, fn)
    print("Done. Files written to:", BG_DIR)
