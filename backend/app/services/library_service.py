import os
import json
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BG_DIR = os.path.normpath(os.path.join(HERE, "..", "static", "backgrounds"))
THUMB_DIR = os.path.normpath(os.path.join(HERE, "..", "static", "thumbnails"))
META_PATH = os.path.join(BG_DIR, "metadata.json")


def _load_metadata():
    with open(META_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def list_backgrounds():
    return _load_metadata()


def get_background_path(bg_id: str) -> str:
    safe_id = os.path.basename(bg_id)  # prevent path traversal
    path = os.path.join(BG_DIR, f"{safe_id}.png")
    if not os.path.isfile(path):
        raise FileNotFoundError(f"لا توجد خلفية بالمعرّف: {bg_id}")
    return path


def get_thumbnail_path(bg_id: str) -> str:
    safe_id = os.path.basename(bg_id)
    path = os.path.join(THUMB_DIR, f"{safe_id}.png")
    if not os.path.isfile(path):
        return get_background_path(bg_id)
    return path


def load_background_image(bg_id: str) -> Image.Image:
    return Image.open(get_background_path(bg_id)).convert("RGB")
