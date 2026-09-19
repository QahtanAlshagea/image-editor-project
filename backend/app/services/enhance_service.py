"""
Pixel-level image enhancements: brightness, contrast, saturation,
exposure, gamma, sharpness, warmth (color temperature) and tint.

All parameters are centered at a "neutral" value so the frontend can
send the full set on every call without needing to know which ones the
user actually touched:

    brightness, contrast, saturation, sharpness  -> 1.0 = no change
    exposure, gamma_shift, temperature, tint      -> 0.0 = no change
"""

import numpy as np
from PIL import Image, ImageEnhance


def _apply_exposure(arr: np.ndarray, stops: float) -> np.ndarray:
    if stops == 0:
        return arr
    factor = 2.0 ** stops
    return np.clip(arr.astype(np.float32) * factor, 0, 255)


def _apply_gamma(arr: np.ndarray, gamma_shift: float) -> np.ndarray:
    if gamma_shift == 0:
        return arr
    gamma = max(0.1, 1.0 + gamma_shift)
    normalized = np.clip(arr, 0, 255) / 255.0
    corrected = np.power(normalized, 1.0 / gamma) * 255.0
    return corrected


def _apply_temperature(arr: np.ndarray, temperature: float, tint: float) -> np.ndarray:
    if temperature == 0 and tint == 0:
        return arr
    out = arr.copy()
    # temperature > 0 -> warmer (boost red / lower blue); < 0 -> cooler
    out[:, :, 0] = out[:, :, 0] + temperature * 40
    out[:, :, 2] = out[:, :, 2] - temperature * 40
    # tint > 0 -> magenta; < 0 -> green
    out[:, :, 1] = out[:, :, 1] - tint * 30
    out[:, :, 0] = out[:, :, 0] + tint * 10
    out[:, :, 2] = out[:, :, 2] + tint * 10
    return np.clip(out, 0, 255)


def apply_pixel_adjustments(
    img: Image.Image,
    brightness: float = 1.0,
    contrast: float = 1.0,
    saturation: float = 1.0,
    sharpness: float = 1.0,
    exposure: float = 0.0,
    gamma_shift: float = 0.0,
    temperature: float = 0.0,
    tint: float = 0.0,
) -> Image.Image:
    has_alpha = img.mode == "RGBA"
    alpha = img.split()[-1] if has_alpha else None
    rgb = img.convert("RGB")

    arr = np.array(rgb).astype(np.float32)
    arr = _apply_exposure(arr, exposure)
    arr = _apply_gamma(arr, gamma_shift)
    arr = _apply_temperature(arr, temperature, tint)
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    out = Image.fromarray(arr, "RGB")

    if brightness != 1.0:
        out = ImageEnhance.Brightness(out).enhance(max(0.0, brightness))
    if contrast != 1.0:
        out = ImageEnhance.Contrast(out).enhance(max(0.0, contrast))
    if saturation != 1.0:
        out = ImageEnhance.Color(out).enhance(max(0.0, saturation))
    if sharpness != 1.0:
        out = ImageEnhance.Sharpness(out).enhance(max(0.0, sharpness))

    if has_alpha:
        out = out.convert("RGBA")
        out.putalpha(alpha)

    return out
