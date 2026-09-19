"""
Common helpers shared by every image-processing service:
loading uploaded files into PIL/OpenCV, and serializing results back
into an HTTP response.
"""

import io
import os
from PIL import Image, ImageFont
import numpy as np
from flask import send_file

_FONTS_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "static", "fonts"))
_FONT_CACHE = {}


def get_font(size: int, bold: bool = True):
    """Load the bundled DejaVu font at a given size (cached). Bundling the
    font file guarantees it renders identically on every OS, instead of
    relying on a system font that may not exist on the machine running
    this app (e.g. Windows without DejaVu installed)."""
    key = (size, bold)
    if key in _FONT_CACHE:
        return _FONT_CACHE[key]
    filename = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    path = os.path.join(_FONTS_DIR, filename)
    try:
        font = ImageFont.truetype(path, size)
    except Exception:  # noqa: BLE001
        font = ImageFont.load_default()
    _FONT_CACHE[key] = font
    return font


class ImageError(ValueError):
    """Raised when an uploaded file cannot be read as an image."""


def load_pil_image(file_storage) -> Image.Image:
    """Load a Flask ``FileStorage`` into a PIL Image (RGBA for safety)."""
    if file_storage is None or file_storage.filename == "":
        raise ImageError("لم يتم إرفاق أي صورة")
    try:
        img = Image.open(file_storage.stream)
        img.load()
    except Exception as exc:  # noqa: BLE001
        raise ImageError("تعذر قراءة الصورة، تأكد من صيغة الملف") from exc

    # Respect EXIF orientation (common with phone photos)
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except Exception:  # noqa: BLE001
        pass

    return img


def pil_to_cv(img: Image.Image) -> np.ndarray:
    """PIL (RGB/RGBA) -> OpenCV BGR/BGRA numpy array."""
    arr = np.array(img)
    if arr.ndim == 2:
        return arr
    if arr.shape[2] == 4:
        return arr[:, :, [2, 1, 0, 3]]
    return arr[:, :, ::-1]


def cv_to_pil(arr: np.ndarray) -> Image.Image:
    """OpenCV BGR/BGRA numpy array -> PIL Image."""
    if arr.ndim == 2:
        return Image.fromarray(arr)
    if arr.shape[2] == 4:
        rgba = arr[:, :, [2, 1, 0, 3]]
        return Image.fromarray(rgba, "RGBA")
    rgb = arr[:, :, ::-1]
    return Image.fromarray(rgb, "RGB")


FORMAT_MIME = {
    "PNG": "image/png",
    "JPEG": "image/jpeg",
    "WEBP": "image/webp",
    "BMP": "image/bmp",
    "GIF": "image/gif",
    "TIFF": "image/tiff",
}


def image_response(img: Image.Image, fmt: str = "PNG", filename: str = "result", quality: int = 95):
    """Serialize a PIL image and return it as a Flask file response."""
    fmt = fmt.upper()
    if fmt not in FORMAT_MIME:
        fmt = "PNG"

    buf = io.BytesIO()
    save_img = img
    save_kwargs = {}

    if fmt in ("JPEG", "BMP"):
        # These formats don't support alpha — flatten onto white.
        if save_img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", save_img.size, (255, 255, 255))
            rgba = save_img.convert("RGBA")
            background.paste(rgba, mask=rgba.split()[-1])
            save_img = background
        else:
            save_img = save_img.convert("RGB")
        if fmt == "JPEG":
            save_kwargs["quality"] = quality
            save_kwargs["optimize"] = True

    if fmt == "WEBP":
        save_kwargs["quality"] = quality

    if fmt == "PNG":
        # `optimize=True` runs multiple compression strategies and can be
        # noticeably slow on larger images — since every single processing
        # step in this app round-trips a PNG, that overhead was multiplying
        # on every click. A low compress_level keeps encoding fast; file
        # size is not a priority for images that get re-uploaded again on
        # the very next edit.
        save_kwargs["compress_level"] = 0

    save_img.save(buf, format=fmt, **save_kwargs)
    buf.seek(0)

    ext = fmt.lower() if fmt != "JPEG" else "jpg"
    return send_file(
        buf,
        mimetype=FORMAT_MIME[fmt],
        as_attachment=False,
        download_name=f"{filename}.{ext}",
    )


def get_form_float(form, key, default):
    try:
        val = form.get(key, default)
        return float(val)
    except (TypeError, ValueError):
        return float(default)


def get_form_int(form, key, default):
    try:
        val = form.get(key, default)
        return int(float(val))
    except (TypeError, ValueError):
        return int(default)


def get_form_bool(form, key, default=False):
    val = form.get(key)
    if val is None:
        return default
    return str(val).strip().lower() in ("1", "true", "yes", "on")
