from flask import Blueprint, request, jsonify
from ..services.image_io import load_pil_image, image_response, get_form_int, get_form_float, get_form_bool, ImageError
from ..services import transform_service as ts

transform_bp = Blueprint("transform", __name__)


def _load(req):
    return load_pil_image(req.files.get("image"))


@transform_bp.route("/crop", methods=["POST"])
def crop_route():
    try:
        img = _load(request)
    except ImageError as e:
        return jsonify({"error": str(e)}), 400
    x = get_form_int(request.form, "x", 0)
    y = get_form_int(request.form, "y", 0)
    width = get_form_int(request.form, "width", img.width)
    height = get_form_int(request.form, "height", img.height)
    result = ts.crop(img, x, y, width, height)
    return image_response(result, fmt="PNG", filename="cropped")


@transform_bp.route("/resize", methods=["POST"])
def resize_route():
    try:
        img = _load(request)
    except ImageError as e:
        return jsonify({"error": str(e)}), 400
    width = get_form_int(request.form, "width", img.width)
    height = get_form_int(request.form, "height", img.height)
    keep_aspect = get_form_bool(request.form, "keep_aspect", False)
    result = ts.resize(img, width, height, keep_aspect)
    return image_response(result, fmt="PNG", filename="resized")


@transform_bp.route("/rotate", methods=["POST"])
def rotate_route():
    try:
        img = _load(request)
    except ImageError as e:
        return jsonify({"error": str(e)}), 400
    angle = get_form_float(request.form, "angle", 0)
    expand = get_form_bool(request.form, "expand", True)
    result = ts.rotate(img, angle, expand)
    return image_response(result, fmt="PNG", filename="rotated")


@transform_bp.route("/flip", methods=["POST"])
def flip_route():
    try:
        img = _load(request)
    except ImageError as e:
        return jsonify({"error": str(e)}), 400
    direction = request.form.get("direction", "horizontal")
    result = ts.flip(img, direction)
    return image_response(result, fmt="PNG", filename="flipped")
