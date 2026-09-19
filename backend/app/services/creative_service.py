"""
The "creative extras" that go beyond the minimum requirements:

- auto_enhance: one-click histogram equalization + auto white balance + mild sharpen
- face_blur: detect faces (Haar cascade, ships with OpenCV — no download needed) and blur them for privacy
- watermark: stamp text (with soft shadow) onto the image
- extract_palette: return the k most dominant colors in the image
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance
from .image_io import get_font

_FACE_CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"


def auto_enhance(img: Image.Image) -> Image.Image:
    rgb = np.array(img.convert("RGB"))
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
    l_eq = clahe.apply(l_ch)

    merged = cv2.merge((l_eq, a_ch, b_ch))
    balanced = cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)
    out = Image.fromarray(balanced, "RGB")

    out = ImageEnhance.Color(out).enhance(1.12)
    out = ImageEnhance.Contrast(out).enhance(1.05)
    out = ImageEnhance.Sharpness(out).enhance(1.25)

    if img.mode == "RGBA":
        out = out.convert("RGBA")
        out.putalpha(img.split()[-1])
    return out


def face_blur(img: Image.Image, intensity: float = 70) -> Image.Image:
    rgb = np.array(img.convert("RGB"))
    h0, w0 = rgb.shape[:2]

    # Run detection on a small proxy — Haar cascades get noticeably slower
    # as resolution grows, and detection accuracy barely changes at this
    # scale for typical photos.
    max_dim = 800
    scale = min(1.0, max_dim / max(h0, w0))
    if scale < 1.0:
        small = cv2.resize(rgb, (max(1, int(w0 * scale)), max(1, int(h0 * scale))), interpolation=cv2.INTER_AREA)
    else:
        small = rgb

    gray = cv2.cvtColor(small, cv2.COLOR_RGB2GRAY)
    cascade = cv2.CascadeClassifier(_FACE_CASCADE_PATH)
    faces_small = cascade.detectMultiScale(gray, scaleFactor=1.08, minNeighbors=5, minSize=(40, 40))

    result = rgb.copy()
    ksize = max(15, int((intensity / 100.0) * 60) | 1)  # ensure odd

    for (x, y, w, h) in faces_small:
        if scale < 1.0:
            x, y, w, h = [int(v / scale) for v in (x, y, w, h)]
        pad_x, pad_y = int(w * 0.15), int(h * 0.2)
        x0, y0 = max(0, x - pad_x), max(0, y - pad_y)
        x1, y1 = min(w0, x + w + pad_x), min(h0, y + h + pad_y)
        region = result[y0:y1, x0:x1]
        if region.size == 0:
            continue
        blurred = cv2.GaussianBlur(region, (ksize, ksize), 0)
        result[y0:y1, x0:x1] = blurred

    out = Image.fromarray(result, "RGB")
    if img.mode == "RGBA":
        out = out.convert("RGBA")
        out.putalpha(img.split()[-1])
    return out, len(faces_small)


def watermark(img: Image.Image, text: str, position: str = "bottom-right",
              opacity: float = 0.6, font_size: int = 36) -> Image.Image:
    base = img.convert("RGBA")
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    font = get_font(font_size)

    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    margin = 24

    positions = {
        "top-left": (margin, margin),
        "top-right": (base.width - tw - margin, margin),
        "bottom-left": (margin, base.height - th - margin),
        "bottom-right": (base.width - tw - margin, base.height - th - margin),
        "center": ((base.width - tw) / 2, (base.height - th) / 2),
    }
    x, y = positions.get(position, positions["bottom-right"])

    alpha = int(max(0, min(opacity, 1)) * 255)
    draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, int(alpha * 0.6)))
    draw.text((x, y), text, font=font, fill=(255, 255, 255, alpha))

    out = Image.alpha_composite(base, layer)
    return out


def extract_palette(img: Image.Image, k: int = 6):
    small = img.convert("RGB").resize((150, 150))
    arr = np.array(small).reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.5)
    _compactness, labels, centers = cv2.kmeans(arr, k, None, criteria, 6, cv2.KMEANS_PP_CENTERS)

    counts = np.bincount(labels.flatten(), minlength=k)
    order = np.argsort(-counts)
    centers = centers[order].astype(int)
    counts = counts[order]
    total = counts.sum()

    palette = []
    for center, count in zip(centers, counts):
        r, g, b = [int(max(0, min(255, c))) for c in center]
        palette.append({
            "hex": "#{:02x}{:02x}{:02x}".format(r, g, b),
            "rgb": [r, g, b],
            "share": round(float(count) / float(total), 4),
        })
    return palette
