import React, { useEffect, useRef, useState } from "react";

const HANDLES = ["nw", "ne", "sw", "se"];
const MIN_SIZE = 24;

/**
 * Renders a draggable, resizable crop rectangle on top of the displayed
 * image. Works entirely in "displayed pixel" space (relative to the image
 * box) and reports the equivalent rectangle in the ORIGINAL image's pixel
 * space via `onChange`, using `box.scale` to convert.
 */
export default function CropOverlay({ box, resetKey, onChange }) {
  const [rect, setRect] = useState(null);
  const dragState = useRef(null);

  // (Re)initialize the crop rect to the full image whenever a new image
  // loads or the displayed box size changes meaningfully.
  useEffect(() => {
    if (!box.width || !box.height) return;
    const inset = 0.08;
    const next = {
      x: box.width * inset,
      y: box.height * inset,
      w: box.width * (1 - inset * 2),
      h: box.height * (1 - inset * 2),
    };
    setRect(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, box.width, box.height]);

  useEffect(() => {
    if (!rect || !box.scale) return;
    onChange({
      x: Math.round(rect.x * box.scale),
      y: Math.round(rect.y * box.scale),
      width: Math.round(rect.w * box.scale),
      height: Math.round(rect.h * box.scale),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rect, box.scale]);

  if (!rect) return null;

  const clamp = (r) => {
    let { x, y, w, h } = r;
    w = Math.max(MIN_SIZE, Math.min(w, box.width));
    h = Math.max(MIN_SIZE, Math.min(h, box.height));
    x = Math.max(0, Math.min(x, box.width - w));
    y = Math.max(0, Math.min(y, box.height - h));
    return { x, y, w, h };
  };

  const startDrag = (e, mode, handle) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragState.current = {
      mode,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: { ...rect },
    };
  };

  const onPointerMove = (e) => {
    const st = dragState.current;
    if (!st) return;
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;

    if (st.mode === "move") {
      setRect(clamp({ ...st.startRect, x: st.startRect.x + dx, y: st.startRect.y + dy }));
      return;
    }

    // resize
    let { x, y, w, h } = st.startRect;
    if (st.handle.includes("e")) w = st.startRect.w + dx;
    if (st.handle.includes("s")) h = st.startRect.h + dy;
    if (st.handle.includes("w")) {
      w = st.startRect.w - dx;
      x = st.startRect.x + dx;
    }
    if (st.handle.includes("n")) {
      h = st.startRect.h - dy;
      y = st.startRect.y + dy;
    }
    setRect(clamp({ x, y, w, h }));
  };

  const endDrag = () => {
    dragState.current = null;
  };

  const handlePos = (h) => {
    const styles = { position: "absolute" };
    if (h.includes("n")) styles.top = -7;
    if (h.includes("s")) styles.bottom = -7;
    if (h.includes("w")) styles.left = -7;
    if (h.includes("e")) styles.right = -7;
    styles.cursor = h === "nw" || h === "se" ? "nwse-resize" : "nesw-resize";
    return styles;
  };

  return (
    <div
      className="crop-overlay"
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      onPointerDown={(e) => startDrag(e, "move", null)}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
    >
      <div className="crop-overlay__grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} />
        ))}
      </div>
      {HANDLES.map((h) => (
        <div
          key={h}
          className="crop-handle"
          style={handlePos(h)}
          onPointerDown={(e) => startDrag(e, "resize", h)}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
        />
      ))}
    </div>
  );
}
