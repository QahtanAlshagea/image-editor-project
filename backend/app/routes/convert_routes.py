from flask import Blueprint, request, jsonify
from ..services.image_io import load_pil_image, image_response, get_form_int, ImageError

convert_bp = Blueprint("convert", __name__)

SUPPORTED = {"png", "jpeg", "jpg", "webp", "bmp", "gif", "tiff"}


@convert_bp.route("", methods=["POST"])
def convert_format():
    """Convert an uploaded image to a different file format."""
    try:
        img = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400

    target = request.form.get("target_format", "png").lower()
    if target == "jpg":
        target = "jpeg"
    if target not in SUPPORTED:
        return jsonify({"error": f"صيغة غير مدعومة: {target}"}), 400

    quality = get_form_int(request.form, "quality", 95)
    return image_response(img, fmt=target, filename="converted", quality=quality)


@convert_bp.route("/formats", methods=["GET"])
def list_formats():
    return jsonify({"formats": sorted(SUPPORTED)})
