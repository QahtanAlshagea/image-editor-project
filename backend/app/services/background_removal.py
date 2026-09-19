"""
Background removal and compositing service.

Primary engine: Adaptive multi-strategy background segmentation.
- Uniform background detection (studio white, solid color, subtle gradients) using LAB color distance.
- Complex/natural photo segmentation using central saliency prior and GrabCut (GC_INIT_WITH_MASK).
- Morphological cleanup, connected-component noise filtering, and anti-aliased edge smoothing.
- Seamless product compositing onto studio backgrounds with realistic ground shadows.
"""

import numpy as np
import cv2
from PIL import Image, ImageOps, ImageFilter

try:
    from rembg import remove as _rembg_remove  # type: ignore
    _HAS_REMBG = True
except Exception:  # noqa: BLE001
    _HAS_REMBG = False


def is_already_transparent(img: Image.Image) -> bool:
    """Check if the image already has meaningful transparency."""
    if img.mode not in ("RGBA", "LA") and (img.mode != "P" or "transparency" not in img.info):
        return False
    alpha = np.array(img.convert("RGBA"))[:, :, 3]
    return bool(np.mean(alpha < 240) > 0.02)


def _grabcut_remove(img: Image.Image, iterations: int = 5, max_dim: int = 800) -> Image.Image:
    """
    High-accuracy local background removal:
    - Analyzes border pixels to detect solid/studio backgrounds.
    - Uses LAB perceptual color distance for precise background seeding.
    - Refines mask with GrabCut, morphological closing, and connected-component filtering.
    - Smooths edges for clean, non-jagged cutouts.
    """
    rgb_full = np.array(img.convert("RGB"))
    h0, w0 = rgb_full.shape[:2]

    scale = min(1.0, max_dim / max(h0, w0))
    if scale < 1.0:
        small_w, small_h = max(1, int(w0 * scale)), max(1, int(h0 * scale))
        small = cv2.resize(rgb_full, (small_w, small_h), interpolation=cv2.INTER_AREA)
    else:
        small = rgb_full

    h, w = small.shape[:2]
    bgr = small[:, :, ::-1].copy()
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)

    # 1. Sample perimeter strips to detect background color
    border_thickness = max(2, int(min(w, h) * 0.04))
    top_strip = lab[:border_thickness, :]
    bottom_strip = lab[-border_thickness:, :]
    left_strip = lab[:, :border_thickness]
    right_strip = lab[:, -border_thickness:]

    border_pixels = np.vstack([
        top_strip.reshape(-1, 3),
        bottom_strip.reshape(-1, 3),
        left_strip.reshape(-1, 3),
        right_strip.reshape(-1, 3),
    ])

    mean_border = np.mean(border_pixels, axis=0)
    std_border = np.std(border_pixels, axis=0)
    is_uniform_border = float(np.mean(std_border)) < 26.0

    # 2. Mask initialization
    mask = np.full((h, w), cv2.GC_PR_FGD, dtype=np.uint8)

    # Borders are definite background
    mask[:border_thickness, :] = cv2.GC_BGD
    mask[-border_thickness:, :] = cv2.GC_BGD
    mask[:, :border_thickness] = cv2.GC_BGD
    mask[:, -border_thickness:] = cv2.GC_BGD

    if is_uniform_border:
        dist_to_bg = np.linalg.norm(lab - mean_border, axis=2)
        bg_thresh = max(18.0, float(np.mean(std_border) * 2.2))

        mask[dist_to_bg < bg_thresh] = cv2.GC_BGD
        mask[(dist_to_bg >= bg_thresh) & (dist_to_bg < bg_thresh * 1.6)] = cv2.GC_PR_BGD

        center_margin_x = int(w * 0.20)
        center_margin_y = int(h * 0.20)
        center_dist = dist_to_bg[center_margin_y:h - center_margin_y, center_margin_x:w - center_margin_x]
        high_contrast = center_dist > (bg_thresh * 2.2)

        center_mask = mask[center_margin_y:h - center_margin_y, center_margin_x:w - center_margin_x]
        center_mask[high_contrast] = cv2.GC_FGD
        mask[center_margin_y:h - center_margin_y, center_margin_x:w - center_margin_x] = center_mask
    else:
        rect_margin_x = max(1, int(w * 0.03))
        rect_margin_y = max(1, int(h * 0.03))
        mask[:rect_margin_y, :] = cv2.GC_BGD
        mask[-rect_margin_y:, :] = cv2.GC_BGD
        mask[:, :rect_margin_x] = cv2.GC_BGD
        mask[:, -rect_margin_x:] = cv2.GC_BGD

    # 3. GrabCut optimization
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)

    try:
        cv2.grabCut(bgr, mask, None, bgd_model, fgd_model, iterations, cv2.GC_INIT_WITH_MASK)
    except cv2.error:
        rect = (border_thickness, border_thickness, max(1, w - 2 * border_thickness), max(1, h - 2 * border_thickness))
        try:
            cv2.grabCut(bgr, mask, rect, bgd_model, fgd_model, iterations, cv2.GC_INIT_WITH_RECT)
        except cv2.error:
            alpha = np.full((h0, w0), 255, dtype=np.uint8)
            return Image.fromarray(np.dstack([rgb_full, alpha]), "RGBA")

    # 4. Extract Foreground Mask
    fg_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

    # 5. Morphological Cleanup (close holes, remove isolated pixels)
    kernel_small = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel_small)

    # Connected component filtering to eliminate floating corner noise
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(fg_mask)
    if num_labels > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        max_area = np.max(areas) if len(areas) > 0 else 0
        cleaned_mask = np.zeros_like(fg_mask)
        for i, area in enumerate(areas, start=1):
            if area >= max(100, int(max_area * 0.03)):
                cleaned_mask[labels == i] = 255
        fg_mask = cleaned_mask

    # 6. Upscale mask to original resolution
    if scale < 1.0:
        alpha_full = cv2.resize(fg_mask, (w0, h0), interpolation=cv2.INTER_LINEAR)
    else:
        alpha_full = fg_mask

    # 7. Edge smoothing (anti-aliasing)
    alpha_blurred = cv2.GaussianBlur(alpha_full, (5, 5), 0)

    rgba = np.dstack([rgb_full, alpha_blurred])
    return Image.fromarray(rgba, "RGBA")


def remove_background(img: Image.Image) -> Image.Image:
    """Return an RGBA image with the background made transparent."""
    if is_already_transparent(img):
        return img.convert("RGBA")

    if _HAS_REMBG:
        try:
            out = _rembg_remove(img.convert("RGBA"))
            return out
        except Exception:  # noqa: BLE001
            pass
    return _grabcut_remove(img)


def add_drop_shadow(subject_rgba: Image.Image, opacity: float = 0.45, blur: int = 18, offset=(0, 14)) -> Image.Image:
    """Render a soft drop shadow layer sized to fit behind ``subject_rgba``."""
    subject_rgba = subject_rgba.convert("RGBA")
    alpha = np.array(subject_rgba.split()[-1])
    shadow_alpha = (alpha.astype(np.float32) * opacity).astype(np.uint8)
    shadow_layer = Image.fromarray(
        np.dstack([np.zeros_like(alpha), np.zeros_like(alpha), np.zeros_like(alpha), shadow_alpha]), mode="RGBA"
    )

    canvas = Image.new("RGBA", (subject_rgba.width + abs(offset[0]) * 2 + blur * 2,
                                subject_rgba.height + abs(offset[1]) * 2 + blur * 2), (0, 0, 0, 0))
    cx = canvas.width // 2 - subject_rgba.width // 2
    cy = canvas.height // 2 - subject_rgba.height // 2
    canvas.paste(shadow_layer, (cx + offset[0], cy + offset[1]), shadow_layer)

    canvas = canvas.filter(ImageFilter.GaussianBlur(blur))
    canvas.paste(subject_rgba, (cx, cy), subject_rgba)
    return canvas


def apply_product_background(
    subject: Image.Image,
    bg_img: Image.Image,
    x_pct: float = 50.0,
    y_pct: float = 55.0,
    scale_multiplier: float = 0.85,
    shadow: bool = True,
    auto_remove: bool = True
) -> Image.Image:
    """
    Accurately places the subject on a chosen background:
    1. Removes background accurately if requested and not already transparent.
    2. Crops subject to its exact non-transparent bounding box for precise positioning.
    3. Fits the background image to the canvas dimensions of the subject.
    4. Scales and centers the subject accurately according to x_pct, y_pct, scale.
    5. Casts a photorealistic ground/drop shadow directly on the background.
    """
    # 1. Background removal
    if auto_remove and not is_already_transparent(subject):
        subject_rgba = remove_background(subject)
    else:
        subject_rgba = subject.convert("RGBA")

    # 2. Crop subject to non-transparent bounding box
    bbox = subject_rgba.getbbox()
    if bbox:
        trimmed = subject_rgba.crop(bbox)
    else:
        trimmed = subject_rgba

    # 3. Canvas dimensions: match the subject's original canvas
    canvas_w, canvas_h = subject.size

    # Fit the background image cleanly to the canvas
    bg_canvas = ImageOps.fit(bg_img.convert("RGBA"), (canvas_w, canvas_h), method=Image.Resampling.LANCZOS)

    # 4. Scale subject to fit within canvas according to scale_multiplier
    sw, sh = trimmed.size
    scale_factor = max(0.1, min(scale_multiplier, 1.5))

    target_max_w = max(10, int(canvas_w * scale_factor))
    target_max_h = max(10, int(canvas_h * scale_factor))
    ratio = min(target_max_w / sw, target_max_h / sh)

    new_w = max(1, int(sw * ratio))
    new_h = max(1, int(sh * ratio))
    placed_subject = trimmed.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 5. Position: center of subject placed at (x_pct, y_pct)
    cx = int(canvas_w * (x_pct / 100.0))
    cy = int(canvas_h * (y_pct / 100.0))
    pos_x = cx - new_w // 2
    pos_y = cy - new_h // 2

    # 6. Realistic Drop Shadow
    if shadow:
        alpha = np.array(placed_subject)[:, :, 3]
        shadow_intensity = 0.45
        shadow_alpha = (alpha.astype(np.float32) * shadow_intensity).astype(np.uint8)

        shadow_layer = Image.fromarray(
            np.dstack([
                np.zeros_like(shadow_alpha),
                np.zeros_like(shadow_alpha),
                np.zeros_like(shadow_alpha),
                shadow_alpha
            ]), mode="RGBA"
        )

        blur_rad = max(4, int(new_h * 0.035))
        offset_y = max(4, int(new_h * 0.025))
        shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(blur_rad))

        # Composite shadow onto background
        bg_canvas.alpha_composite(shadow_layer, (pos_x, pos_y + offset_y))

    # 7. Composite subject onto background
    bg_canvas.alpha_composite(placed_subject, (pos_x, pos_y))

    return bg_canvas.convert("RGB")
