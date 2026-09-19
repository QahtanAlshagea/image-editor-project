from flask import Blueprint, request, jsonify
from ..services.image_io import load_pil_image, image_response, get_form_float, ImageError
from ..services.enhance_service import apply_pixel_adjustments

enhance_bp = Blueprint("enhance", __name__)


@enhance_bp.route("/pixel", methods=["POST"])
def pixel_route():
    try:
        img = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400

    f = request.form
    result = apply_pixel_adjustments(
        img,
        brightness=get_form_float(f, "brightness", 1.0),
        contrast=get_form_float(f, "contrast", 1.0),
        saturation=get_form_float(f, "saturation", 1.0),
        sharpness=get_form_float(f, "sharpness", 1.0),
        exposure=get_form_float(f, "exposure", 0.0),
        gamma_shift=get_form_float(f, "gamma_shift", 0.0),
        temperature=get_form_float(f, "temperature", 0.0),
        tint=get_form_float(f, "tint", 0.0),
    )
    return image_response(result, fmt="PNG", filename="enhanced")
