import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react";

// Draws live on an HTML canvas sized to the displayed image. Strokes are
// kept in "displayed pixel" space for rendering, and converted to the
// original image's pixel space (via box.scale) only when the parent asks
// for them (on "Apply").
const DrawCanvas = forwardRef(function DrawCanvas(
  { box, tool, color, brushWidth, fillEnabled, fillColor, fillOpacity, textValue, fontSize, resetKey, onCountChange },
  ref
) {
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const draftRef = useRef(null); // in-progress stroke, not yet in React state (for perf)
  const drawingRef = useRef(false);

  useEffect(() => {
    setStrokes([]);
  }, [resetKey]);

  useEffect(() => {
    onCountChange?.(strokes.length);
  }, [strokes, onCountChange]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const all = draftRef.current ? [...strokes, draftRef.current] : strokes;
    for (const s of all) drawStroke(ctx, s);
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [redraw, box.width, box.height]);

  function drawStroke(ctx, s) {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.globalAlpha = s.opacity ?? 1;

    if (s.type === "path") {
      if (s.points.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      s.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else if (s.type === "line") {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    } else if (s.type === "arrow") {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      const angle = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
      const len = Math.max(10, s.width * 4);
      for (const a of [angle + (Math.PI * 5) / 6, angle - (Math.PI * 5) / 6]) {
        ctx.beginPath();
        ctx.moveTo(s.x2, s.y2);
        ctx.lineTo(s.x2 + len * Math.cos(a), s.y2 + len * Math.sin(a));
        ctx.stroke();
      }
    } else if (s.type === "rect") {
      const x = Math.min(s.x1, s.x2);
      const y = Math.min(s.y1, s.y2);
      const w = Math.abs(s.x2 - s.x1);
      const h = Math.abs(s.y2 - s.y1);
      if (s.fillColor) {
        ctx.globalAlpha = s.fillOpacity ?? 1;
        ctx.fillStyle = s.fillColor;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = s.opacity ?? 1;
      }
      ctx.strokeRect(x, y, w, h);
    } else if (s.type === "circle") {
      const x = Math.min(s.x1, s.x2);
      const y = Math.min(s.y1, s.y2);
      const w = Math.abs(s.x2 - s.x1);
      const h = Math.abs(s.y2 - s.y1);
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2);
      if (s.fillColor) {
        ctx.globalAlpha = s.fillOpacity ?? 1;
        ctx.fillStyle = s.fillColor;
        ctx.fill();
        ctx.globalAlpha = s.opacity ?? 1;
      }
      ctx.stroke();
    } else if (s.type === "text") {
      ctx.font = `700 ${s.fontSize}px "IBM Plex Sans Arabic", sans-serif`;
      ctx.fillStyle = s.color;
      ctx.textBaseline = "top";
      ctx.fillText(s.text, s.x, s.y);
    }
    ctx.globalAlpha = 1;
  }

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    return { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
  };

  const onPointerDown = (e) => {
    const pos = getPos(e);
    e.currentTarget.setPointerCapture?.(e.pointerId);

    if (tool === "text") {
      if (!textValue) return;
      setStrokes((prev) => [
        ...prev,
        { type: "text", x: pos.x, y: pos.y, text: textValue, color, fontSize: fontSize || 28 },
      ]);
      return;
    }

    drawingRef.current = true;
    if (tool === "pen") {
      draftRef.current = { type: "path", points: [pos], color, width: brushWidth, opacity: 1 };
    } else {
      draftRef.current = {
        type: tool,
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        color,
        width: brushWidth,
        opacity: 1,
        fillColor: fillEnabled ? fillColor : null,
        fillOpacity,
      };
    }
    redraw();
  };

  const onPointerMove = (e) => {
    if (!drawingRef.current || !draftRef.current) return;
    const pos = getPos(e);
    if (draftRef.current.type === "path") {
      draftRef.current.points.push(pos);
    } else {
      draftRef.current.x2 = pos.x;
      draftRef.current.y2 = pos.y;
    }
    redraw();
  };

  const onPointerUp = () => {
    if (!drawingRef.current || !draftRef.current) return;
    drawingRef.current = false;
    const finished = draftRef.current;
    draftRef.current = null;
    setStrokes((prev) => [...prev, finished]);
  };

  useImperativeHandle(ref, () => ({
    getNaturalStrokes() {
      const scale = box.scale || 1;
      const scalePt = (v) => Math.round(v * scale);
      return strokes.map((s) => {
        const copy = { ...s };
        if (copy.points) copy.points = copy.points.map((p) => ({ x: scalePt(p.x), y: scalePt(p.y) }));
        ["x", "y", "x1", "y1", "x2", "y2"].forEach((k) => {
          if (typeof copy[k] === "number") copy[k] = scalePt(copy[k]);
        });
        if (typeof copy.width === "number") copy.width = Math.max(1, Math.round(copy.width * scale));
        if (typeof copy.fontSize === "number") copy.fontSize = Math.round(copy.fontSize * scale);
        return copy;
      });
    },
    clearAll() {
      setStrokes([]);
    },
    undoLast() {
      setStrokes((prev) => prev.slice(0, -1));
    },
    hasStrokes() {
      return strokes.length > 0;
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      width={box.width}
      height={box.height}
      style={{
        position: "absolute",
        left: box.offsetX,
        top: box.offsetY,
        width: box.width,
        height: box.height,
        cursor: tool === "text" ? "text" : "crosshair",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    />
  );
});

export default DrawCanvas;
