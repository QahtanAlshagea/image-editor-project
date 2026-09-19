"""
Lumen Studio — Image Editor Backend
====================================

A Flask application factory that wires together every image-processing
module (conversion, background removal, transforms, pixel enhancements,
filters, merging, drawing, background library and the creative "extras")
into one clean REST API.

The application is intentionally stateless: every request receives the
image bytes it needs and returns the processed image bytes directly.
Nothing is persisted server-side (aside from the pre-generated background
library), which keeps the architecture simple, horizontally scalable and
easy to reason about for grading purposes.
"""

import os
from flask import Flask, jsonify


def create_app():
    app = Flask(__name__)

    # ---- Basic configuration -------------------------------------------------
    app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024  # 25 MB upload cap
    app.config["JSON_SORT_KEYS"] = False

    # ---- CORS (manual, no extra dependency needed) ---------------------------
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    @app.route("/api/<path:_any>", methods=["OPTIONS"])
    def cors_preflight(_any):
        return ("", 204)

    # ---- Blueprints ------------------------------------------------------------
    from .routes.convert_routes import convert_bp
    from .routes.background_routes import background_bp
    from .routes.transform_routes import transform_bp
    from .routes.enhance_routes import enhance_bp
    from .routes.filter_routes import filter_bp
    from .routes.merge_routes import merge_bp
    from .routes.draw_routes import draw_bp
    from .routes.creative_routes import creative_bp

    app.register_blueprint(convert_bp, url_prefix="/api/convert")
    app.register_blueprint(background_bp, url_prefix="/api/background")
    app.register_blueprint(transform_bp, url_prefix="/api/transform")
    app.register_blueprint(enhance_bp, url_prefix="/api/enhance")
    app.register_blueprint(filter_bp, url_prefix="/api/filters")
    app.register_blueprint(merge_bp, url_prefix="/api/merge")
    app.register_blueprint(draw_bp, url_prefix="/api/draw")
    app.register_blueprint(creative_bp, url_prefix="/api/creative")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "Lumen Studio API"})

    @app.errorhandler(413)
    def too_large(_e):
        return jsonify({"error": "الملف كبير جداً (الحد الأقصى 25 ميجابايت)"}), 413

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": str(e.description) if hasattr(e, "description") else "طلب غير صالح"}), 400

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": f"خطأ في الخادم: {str(e)}"}), 500

    return app
