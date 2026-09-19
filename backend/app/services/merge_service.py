"""
Compositing two images together — used both by the generic "merge two
photos" tool and by "place product on a background" tool.
"""

import numpy as np
from PIL import Image, ImageChops


def _resize_by_scale(img: Image.Image, base_size, scale: float) -> Image.Image:
    scale = max(0.02, min(scale, 5.0))
    w = max(1, int(img.width * scale))
    h = max(1, int(img.height * scale))
    return img.resize((w, h), Image.LANCZOS)


def _apply_blend_mode(base_rgb: Image.Image, overlay_rgb: Image.Image, mode: str) -> Image.Image:
    mode = (mode or "normal").lower()
    if mode == "multiply":
        return ImageChops.multiply(base_rgb, overlay_rgb)
    if mode == "screen":
        return ImageChops.screen(base_rgb, overlay_rgb)
    if mode == "overlay":
        base_arr = np.asarray(base_rgb).astype(np.float32) / 255.0
        ov_arr = np.asarray(overlay_rgb).astype(np.float32) / 255.0
        low = 2 * base_arr * ov_arr
        high = 1 - 2 * (1 - base_arr) * (1 - ov_arr)
        result = np.where(base_arr <= 0.5, low, high)
        return Image.fromarray((result * 255).clip(0, 255).astype(np.uint8), "RGB")
    if mode == "darken":
        return ImageChops.darker(base_rgb, overlay_rgb)
    if mode == "lighten":
        return ImageChops.lighter(base_rgb, overlay_rgb)
    return overlay_rgb  # normal


def composite(base_img: Image.Image, overlay_img: Image.Image, x_pct: float, y_pct: float,
              scale: float = 1.0, opacity: float = 1.0, blend_mode: str = "normal") -> Image.Image:
    """
    Paste ``overlay_img`` on top of ``base_img``.

    x_pct / y_pct: position of the overlay's CENTER, expressed as a
    percentage (0-100) of the base image's width/height.
    scale: overlay size multiplier.
    opacity: 0..1
    """
    base = base_img.convert("RGBA")
    overlay = _resize_by_scale(overlay_img.convert("RGBA"), base.size, scale)

    cx = int(base.width * (x_pct / 100.0))
    cy = int(base.height * (y_pct / 100.0))
    px = cx - overlay.width // 2
    py = cy - overlay.height // 2

    if blend_mode.lower() != "normal":
        # Build a same-size canvas for the overlay to blend against base pixels.
        canvas_overlay_rgb = Image.new("RGB", base.size, (255, 255, 255))
        canvas_overlay_rgb.paste(overlay.convert("RGB"), (px, py))
        blended_rgb = _apply_blend_mode(base.convert("RGB"), canvas_overlay_rgb, blend_mode)

        canvas_alpha = Image.new("L", base.size, 0)
        canvas_alpha.paste(overlay.split()[-1], (px, py))
        alpha_scaled = canvas_alpha.point(lambda a: int(a * max(0, min(opacity, 1))))

        blended_rgba = blended_rgb.convert("RGBA")
        blended_rgba.putalpha(alpha_scaled)
        out = Image.alpha_composite(base, blended_rgba)
        return out.convert("RGB")

    if opacity < 1.0:
        alpha = overlay.split()[-1].point(lambda a: int(a * max(0, min(opacity, 1))))
        overlay.putalpha(alpha)

    base.alpha_composite(overlay, (px, py))
    return base.convert("RGB")
