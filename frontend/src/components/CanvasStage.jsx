import React, { useRef, useState, useCallback } from "react";
import { Aperture, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import useZoomFit from "../hooks/useZoomFit.js";
import CropOverlay from "./canvas/CropOverlay.jsx";
import DrawCanvas from "./canvas/DrawCanvas.jsx";

export default function CanvasStage({
  imageUrl,
  busy,
  busyLabel,
  cropEnabled,
  onCropChange,
  cropResetKey,
  drawEnabled,
  drawCanvasRef,
  drawTool,
  drawColor,
  drawWidth,
  drawFillEnabled,
  drawFillColor,
  drawFillOpacity,
  drawTextValue,
  drawFontSize,
  drawResetKey,
  onDrawCountChange,
}) {
  const viewportRef = useRef(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const { zoomPct, setZoom, zoomBy, fitToScreen } = useZoomFit(viewportRef, natural.w, natural.h);

  const hasSize = natural.w > 0 && natural.h > 0;
  const displayWidth = hasSize ? natural.w * (zoomPct / 100) : undefined;
  const displayHeight = hasSize ? natural.h * (zoomPct / 100) : undefined;

  // The frame is sized to EXACTLY match the displayed image, so overlays
  // (crop handles, the drawing canvas) never need offset math — they just
  // fill the frame edge-to-edge.
  const box = {
    width: displayWidth || 0,
    height: displayHeight || 0,
    offsetX: 0,
    offsetY: 0,
    scale: displayWidth ? natural.w / displayWidth : 1,
  };

  const onLoadImage = useCallback((e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    setNatural((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
  }, []);

  const onWheel = useCallback(
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain wheel/trackpad = normal scroll/pan
      e.preventDefault();
      zoomBy(-e.deltaY * 0.4);
    },
    [zoomBy]
  );

  return (
    <div className="stage-canvas">
      <div className="zoom-bar">
        <button type="button" className="zoom-bar__btn" onClick={() => zoomBy(-15)} title="تصغير">
          <ZoomOut size={15} />
        </button>
        <input
          className="zoom-bar__slider"
          type="range"
          min={8}
          max={500}
          value={Math.round(zoomPct)}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
        />
        <button type="button" className="zoom-bar__btn" onClick={() => zoomBy(15)} title="تكبير">
          <ZoomIn size={15} />
        </button>
        <span className="zoom-bar__pct">{Math.round(zoomPct)}%</span>
        <button type="button" className="zoom-bar__btn" onClick={fitToScreen} title="ملائمة الشاشة">
          <Maximize size={14} />
        </button>
      </div>

      <div className="stage-canvas__viewport" ref={viewportRef} onWheel={onWheel}>
        <div
          className="stage-canvas__frame"
          style={hasSize ? { width: displayWidth, height: displayHeight } : undefined}
        >
          <img
            src={imageUrl}
            alt="الصورة قيد التحرير"
            className="stage-canvas__img"
            draggable={false}
            onLoad={onLoadImage}
            style={hasSize ? { width: displayWidth, height: displayHeight } : undefined}
          />

          {hasSize && cropEnabled && (
            <CropOverlay box={box} resetKey={cropResetKey} onChange={onCropChange} />
          )}

          {hasSize && drawEnabled && (
            <DrawCanvas
              ref={drawCanvasRef}
              box={box}
              tool={drawTool}
              color={drawColor}
              brushWidth={drawWidth}
              fillEnabled={drawFillEnabled}
              fillColor={drawFillColor}
              fillOpacity={drawFillOpacity}
              textValue={drawTextValue}
              fontSize={drawFontSize}
              resetKey={drawResetKey}
              onCountChange={onDrawCountChange}
            />
          )}
        </div>
      </div>

      {busy && (
        <div className="stage-busy">
          <div className="stage-busy__content">
            <Aperture className="aperture-spinner" />
            <div className="stage-busy__label">{busyLabel || "جارِ المعالجة..."}</div>
          </div>
        </div>
      )}
    </div>
  );
}
