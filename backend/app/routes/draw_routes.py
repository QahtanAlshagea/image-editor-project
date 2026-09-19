import json
from flask import Blueprint, request, jsonify
from ..services.image_io import load_pil_image, image_response, ImageError
from ..services.draw_service import apply_strokes

draw_bp = Blueprint("draw", __name__)


@draw_bp.route("/apply", methods=["POST"])
def draw_apply():
    try:
        img = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400

    raw = request.form.get("strokes", "[]")
    try:
        strokes = json.loads(raw)
        if not isinstance(strokes, list):
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "بيانات الرسم غير صالحة"}), 400

    result = apply_strokes(img, strokes)
    return image_response(result, fmt="PNG", filename="drawn")
