from flask import Blueprint, request, jsonify, send_file, url_for
from ..services.image_io import load_pil_image, image_response, get_form_float, get_form_bool, ImageError
from ..services.background_removal import remove_background, add_drop_shadow, apply_product_background
from ..services.merge_service import composite
from ..services import library_service

background_bp = Blueprint("background", __name__)


@background_bp.route("/remove", methods=["POST"])
def remove():
    try:
        img = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400

    result = remove_background(img)

    if get_form_bool(request.form, "shadow", False):
        result = add_drop_shadow(result)

    return image_response(result, fmt="PNG", filename="no-bg")


@background_bp.route("/library", methods=["GET"])
def library():
    items = library_service.list_backgrounds()
    for item in items:
        item["thumbnail_url"] = url_for("background.thumbnail", bg_id=item["id"], _external=False)
        item["full_url"] = url_for("background.full_image", bg_id=item["id"], _external=False)
    return jsonify({"backgrounds": items})


@background_bp.route("/library/<bg_id>/thumb", methods=["GET"])
def thumbnail(bg_id):
    try:
        path = library_service.get_thumbnail_path(bg_id)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    return send_file(path, mimetype="image/png")


@background_bp.route("/library/<bg_id>/full", methods=["GET"])
def full_image(bg_id):
    try:
        path = library_service.get_background_path(bg_id)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    return send_file(path, mimetype="image/png")


@background_bp.route("/apply", methods=["POST"])
def apply_background():
    """
    Take a subject image (auto background-removed unless already
    transparent) and place it on a chosen library background OR a
    custom uploaded background, preserving canvas dimensions and exact scaling.
    """
    try:
        subject = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400

    bg_file = request.files.get("background")
    bg_id = request.form.get("background_id")

    if bg_file is not None and bg_file.filename:
        try:
            bg_img = load_pil_image(bg_file)
        except ImageError as e:
            return jsonify({"error": str(e)}), 400
    elif bg_id:
        try:
            bg_img = library_service.load_background_image(bg_id)
        except FileNotFoundError as e:
            return jsonify({"error": str(e)}), 404
    else:
        return jsonify({"error": "الرجاء اختيار خلفية من المكتبة أو رفع خلفية مخصصة"}), 400

    auto_remove = get_form_bool(request.form, "auto_remove", True)
    shadow = get_form_bool(request.form, "shadow", True)
    x_pct = get_form_float(request.form, "x", 50.0)
    y_pct = get_form_float(request.form, "y", 55.0)
    scale = get_form_float(request.form, "scale", 0.85)

    result = apply_product_background(
        subject=subject,
        bg_img=bg_img,
        x_pct=x_pct,
        y_pct=y_pct,
        scale_multiplier=scale,
        shadow=shadow,
        auto_remove=auto_remove,
    )
    return image_response(result, fmt="PNG", filename="product-shot")

