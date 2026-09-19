from flask import Blueprint, request, jsonify
from ..services.image_io import load_pil_image, image_response, get_form_float, get_form_int, ImageError
from ..services import creative_service as cs

creative_bp = Blueprint("creative", __name__)


@creative_bp.route("/auto_enhance", methods=["POST"])
def auto_enhance_route():
    try:
        img = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400
    result = cs.auto_enhance(img)
    return image_response(result, fmt="PNG", filename="auto-enhanced")


@creative_bp.route("/face_blur", methods=["POST"])
def face_blur_route():
    try:
        img = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400
    intensity = get_form_float(request.form, "intensity", 70)
    result, num_faces = cs.face_blur(img, intensity)
    response = image_response(result, fmt="PNG", filename="face-blurred")
    response.headers["X-Faces-Detected"] = str(num_faces)
    return response


@creative_bp.route("/watermark", methods=["POST"])
def watermark_route():
    try:
        img = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400
    text = request.form.get("text", "© Al-Kayyal")
    position = request.form.get("position", "bottom-right")
    opacity = get_form_float(request.form, "opacity", 0.6)
    font_size = get_form_int(request.form, "font_size", 36)
    result = cs.watermark(img, text, position, opacity, font_size)
    return image_response(result, fmt="PNG", filename="watermarked")


@creative_bp.route("/palette", methods=["POST"])
def palette_route():
    try:
        img = load_pil_image(request.files.get("image"))
    except ImageError as e:
        return jsonify({"error": str(e)}), 400
    k = get_form_int(request.form, "k", 6)
    k = max(2, min(k, 10))
    palette = cs.extract_palette(img, k)
    return jsonify({"palette": palette})
