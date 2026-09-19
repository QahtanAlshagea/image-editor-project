from PIL import Image


def crop(img: Image.Image, x: int, y: int, width: int, height: int) -> Image.Image:
    x = max(0, min(x, img.width - 1))
    y = max(0, min(y, img.height - 1))
    width = max(1, min(width, img.width - x))
    height = max(1, min(height, img.height - y))
    return img.crop((x, y, x + width, y + height))


def resize(img: Image.Image, width: int, height: int, keep_aspect: bool = False) -> Image.Image:
    width = max(1, width)
    height = max(1, height)
    if keep_aspect:
        ratio = min(width / img.width, height / img.height)
        width = max(1, int(img.width * ratio))
        height = max(1, int(img.height * ratio))
    return img.resize((width, height), Image.LANCZOS)


def rotate(img: Image.Image, angle: float, expand: bool = True) -> Image.Image:
    fill = (0, 0, 0, 0) if img.mode == "RGBA" else (255, 255, 255)
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    rotated = img.rotate(-angle, resample=Image.BICUBIC, expand=expand, fillcolor=(0, 0, 0, 0))
    return rotated


def flip(img: Image.Image, direction: str) -> Image.Image:
    if direction == "horizontal":
        return img.transpose(Image.FLIP_LEFT_RIGHT)
    if direction == "vertical":
        return img.transpose(Image.FLIP_TOP_BOTTOM)
    return img
