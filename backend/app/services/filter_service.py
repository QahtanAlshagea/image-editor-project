"""
Creative / convolution-style filters: smoothing (blur), edge sharpening,
edge detection, grayscale, sepia, invert, vintage, cartoon, emboss and
posterize. ``intensity`` is 0-100 and scales the strength of the effect
where applicable.
"""

import numpy as np
import cv2
from PIL import Image, ImageFilter, ImageOps


def _to_cv(img: Image.Image) -> np.ndarray:
    rgb = np.array(img.convert("RGB"))
    return rgb[:, :, ::-1].copy()


def _from_cv(bgr: np.ndarray) -> Image.Image:
    return Image.fromarray(bgr[:, :, ::-1])


def blur(img, intensity=50):
    radius = max(0.5, (intensity / 100.0) * 12)
    return img.filter(ImageFilter.GaussianBlur(radius))


def sharpen(img, intensity=50):
    percent = int(80 + (intensity / 100.0) * 220)
    return img.filter(ImageFilter.UnsharpMask(radius=2, percent=percent, threshold=2))


def edge_detect(img, intensity=50):
    bgr = _to_cv(img)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    low = max(10, 100 - intensity)
    high = low * 3
    edges = cv2.Canny(gray, low, high)
    edges_rgb = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    return _from_cv(edges_rgb)


def grayscale(img, intensity=100):
    gray = ImageOps.grayscale(img).convert("RGB")
    if intensity >= 100:
        return gray
    return Image.blend(img.convert("RGB"), gray, intensity / 100.0)


def sepia(img, intensity=100):
    rgb = np.array(img.convert("RGB")).astype(np.float32)
    sepia_matrix = np.array([
        [0.393, 0.769, 0.189],
        [0.349, 0.686, 0.168],
        [0.272, 0.534, 0.131],
    ])
    toned = rgb @ sepia_matrix.T
    toned = np.clip(toned, 0, 255)
    result = Image.fromarray(toned.astype(np.uint8), "RGB")
    if intensity >= 100:
        return result
    return Image.blend(img.convert("RGB"), result, intensity / 100.0)


def invert(img, intensity=100):
    rgb = img.convert("RGB")
    inverted = ImageOps.invert(rgb)
    if intensity >= 100:
        return inverted
    return Image.blend(rgb, inverted, intensity / 100.0)


def vintage(img, intensity=60):
    toned = sepia(img, intensity=70)
    arr = np.array(toned).astype(np.float32)
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w / 2, h / 2
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    max_dist = np.sqrt(cx ** 2 + cy ** 2)
    vignette = 1 - 0.45 * (dist / max_dist) ** 2 * (intensity / 100.0)
    arr *= vignette[:, :, np.newaxis]
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    result = Image.fromarray(arr, "RGB")
    noise = (np.random.randn(h, w, 1) * (6 * intensity / 100.0)).astype(np.int16)
    noisy = np.clip(np.array(result).astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(noisy, "RGB")


def cartoon(img, intensity=60):
    bgr = _to_cv(img)
    num_down, num_bilateral = 2, 6
    color = bgr.copy()
    for _ in range(num_down):
        color = cv2.pyrDown(color)
    for _ in range(num_bilateral):
        color = cv2.bilateralFilter(color, d=9, sigmaColor=9, sigmaSpace=7)
    for _ in range(num_down):
        color = cv2.pyrUp(color)
    color = cv2.resize(color, (bgr.shape[1], bgr.shape[0]))

    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.medianBlur(gray, 7)
    edges = cv2.adaptiveThreshold(
        gray_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY,
        blockSize=9, C=max(2, 2 + int(intensity / 20)),
    )
    edges_color = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    cartoon_bgr = cv2.bitwise_and(color, edges_color)
    return _from_cv(cartoon_bgr)


def emboss(img, intensity=50):
    kernel = np.array([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]]) * (intensity / 50.0)
    bgr = _to_cv(img)
    embossed = cv2.filter2D(bgr, -1, kernel) + 128
    embossed = np.clip(embossed, 0, 255).astype(np.uint8)
    return _from_cv(embossed)


def posterize(img, intensity=50):
    bits = max(1, min(8, int(8 - (intensity / 100.0) * 6)))
    rgb = img.convert("RGB")
    return ImageOps.posterize(rgb, bits)


FILTERS = {
    "blur": blur,
    "sharpen": sharpen,
    "edge": edge_detect,
    "grayscale": grayscale,
    "sepia": sepia,
    "invert": invert,
    "vintage": vintage,
    "cartoon": cartoon,
    "emboss": emboss,
    "posterize": posterize,
}


def apply_filter(img: Image.Image, name: str, intensity: float = 50) -> Image.Image:
    fn = FILTERS.get(name)
    if fn is None:
        raise ValueError(f"فلتر غير معروف: {name}")
    return fn(img, intensity)
