from flask import Blueprint, request, jsonify
from ..services.image_io import load_pil_image, image_response, get_form_float, ImageError
from ..services.merge_service import composite

merge_bp = Blueprint("merge", __name__)


@merge_bp.route("", methods=["POST"])
def merge_route():
    """Merge two uploaded images: image (base layer) + image2 (overlay)."""
    try:
        base = load_pil_image(request.files.get("image"))
        overlay = load_pil_image(request.files.get("image2"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400

    x = get_form_float(request.form, "x", 50)
    y = get_form_float(request.form, "y", 50)
    scale = get_form_float(request.form, "scale", 1.0)
    opacity = get_form_float(request.form, "opacity", 1.0)
    blend_mode = request.form.get("blend_mode", "normal")

    result = composite(base, overlay, x, y, scale=scale, opacity=opacity, blend_mode=blend_mode)
    return image_response(result, fmt="PNG", filename="merged")
