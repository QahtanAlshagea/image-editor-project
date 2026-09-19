from flask import Blueprint, request, jsonify
from ..services.image_io import load_pil_image, image_response, get_form_float, ImageError
from ..services.filter_service import apply_filter, FILTERS

filter_bp = Blueprint("filters", __name__)


@filter_bp.route("", methods=["POST"])
def apply_filter_route():
    try:
        img = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400

    name = request.form.get("filter", "")
    intensity = get_form_float(request.form, "intensity", 50)

    try:
        result = apply_filter(img, name, intensity)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return image_response(result, fmt="PNG", filename=f"filter-{name}")


@filter_bp.route("/list", methods=["GET"])
def list_filters():
    return jsonify({"filters": sorted(FILTERS.keys())})
