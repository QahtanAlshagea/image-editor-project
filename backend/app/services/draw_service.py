"""
Bake a list of vector "strokes" (produced by the frontend's canvas
drawing tool) permanently into an image using PIL's ImageDraw. The
frontend renders these live on an HTML canvas for a smooth drawing
experience, then calls this endpoint once to commit the drawing into
the actual image pixels when the user hits "Apply".
"""

import math
from PIL import Image, ImageDraw
from .image_io import get_font


def _hex_to_rgba(color: str, opacity: float = 1.0):
    color = (color or "#ff0000").lstrip("#")
    if len(color) == 3:
        color = "".join(c * 2 for c in color)
    r, g, b = int(color[0:2], 16), int(color[2:4], 16), int(color[4:6], 16)
    return (r, g, b, int(max(0, min(opacity, 1)) * 255))


def _draw_arrow(draw: ImageDraw.ImageDraw, p1, p2, color, width):
    draw.line([p1, p2], fill=color, width=width)
    angle = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
    length = max(10, width * 4)
    for a in (angle + math.radians(150), angle - math.radians(150)):
        head = (p2[0] + length * math.cos(a), p2[1] + length * math.sin(a))
        draw.line([p2, head], fill=color, width=width)


def apply_strokes(img: Image.Image, strokes: list) -> Image.Image:
    base = img.convert("RGBA")
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    for s in strokes:
        s_type = s.get("type")
        color = _hex_to_rgba(s.get("color", "#ff3b30"), s.get("opacity", 1.0))
        width = max(1, int(s.get("width", 4)))

        if s_type == "path":
            pts = [(p["x"], p["y"]) for p in s.get("points", [])]
            if len(pts) == 1:
                r = width / 2
                x, y = pts[0]
                draw.ellipse([x - r, y - r, x + r, y + r], fill=color)
            elif len(pts) > 1:
                draw.line(pts, fill=color, width=width, joint="curve")
                r = width / 2
                for (x, y) in (pts[0], pts[-1]):
                    draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

        elif s_type == "line":
            draw.line([(s["x1"], s["y1"]), (s["x2"], s["y2"])], fill=color, width=width)

        elif s_type == "arrow":
            _draw_arrow(draw, (s["x1"], s["y1"]), (s["x2"], s["y2"]), color, width)

        elif s_type == "rect":
            box = [s["x1"], s["y1"], s["x2"], s["y2"]]
            fill = _hex_to_rgba(s["fillColor"], s.get("fillOpacity", 1.0)) if s.get("fillColor") else None
            draw.rectangle(box, outline=color, width=width, fill=fill)

        elif s_type in ("circle", "ellipse"):
            box = [s["x1"], s["y1"], s["x2"], s["y2"]]
            fill = _hex_to_rgba(s["fillColor"], s.get("fillOpacity", 1.0)) if s.get("fillColor") else None
            draw.ellipse(box, outline=color, width=width, fill=fill)

        elif s_type == "text":
            font_size = int(s.get("fontSize", 28))
            font = get_font(font_size)
            draw.text((s["x"], s["y"]), s.get("text", ""), fill=color, font=font)

    out = Image.alpha_composite(base, layer)
    return out
