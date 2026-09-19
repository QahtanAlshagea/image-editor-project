import React from "react";
import { Pencil, Minus, ArrowUpRight, Square, Circle, Type, Check, Trash2, Undo2 } from "lucide-react";
import { PanelHeader, PanelBody, SectionTitle } from "../ui/Panel.jsx";
import DialSlider from "../ui/DialSlider.jsx";
import Toggle from "../ui/Toggle.jsx";
import Button from "../ui/Button.jsx";
import api from "../../api/client.js";

const DRAW_TOOLS = [
  { id: "pen", label: "قلم", icon: Pencil },
  { id: "line", label: "خط", icon: Minus },
  { id: "arrow", label: "سهم", icon: ArrowUpRight },
  { id: "rect", label: "مستطيل", icon: Square },
  { id: "circle", label: "دائرة", icon: Circle },
  { id: "text", label: "نص", icon: Type },
];

export default function DrawPanel({ editor, draw, canvasRef, strokeCount, onApplied }) {
  const handleApply = async () => {
    const strokes = canvasRef.current?.getNaturalStrokes() || [];
    if (strokes.length === 0) return;
    const result = await editor.runEdit("رسم", () => api.drawApply(editor.current.blob, strokes));
    // Only clear the drawing once it's safely committed to history — if the
    // request failed, runEdit already surfaced the error toast, and the
    // user's strokes stay on the canvas so they can retry without redrawing.
    if (result) {
      canvasRef.current?.clearAll();
      onApplied?.();
    }
  };

  return (
    <>
      <PanelHeader
        eyebrow="06 — الرسم"
        title="الرسم على الصورة"
        description="ارسم بحرية أو أضف أشكالاً ونصوصاً مباشرة فوق الصورة."
      />
      <PanelBody>
        <SectionTitle>الأداة</SectionTitle>
        <div className="filter-grid">
          {DRAW_TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                className={`filter-tile${draw.tool === t.id ? " is-active" : ""}`}
                onClick={() => draw.setTool(t.id)}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {draw.tool === "text" && (
          <div className="field-group">
            <div className="field-label"><span>النص</span></div>
            <input
              className="select"
              type="text"
              placeholder="اكتب النص هنا"
              value={draw.textValue}
              onChange={(e) => draw.setTextValue(e.target.value)}
            />
            <DialSlider label="حجم الخط" value={draw.fontSize} min={12} max={96} onChange={draw.setFontSize} unit="px" />
          </div>
        )}

        <SectionTitle>المظهر</SectionTitle>
        <div className="field-row" style={{ alignItems: "center" }}>
          <div className="field-group">
            <div className="field-label"><span>لون الخط</span></div>
            <input
              className="color-swatch-input"
              type="color"
              value={draw.color}
              onChange={(e) => draw.setColor(e.target.value)}
            />
          </div>
          {["rect", "circle"].includes(draw.tool) && (
            <div className="field-group">
              <div className="field-label"><span>لون التعبئة</span></div>
              <input
                className="color-swatch-input"
                type="color"
                value={draw.fillColor}
                onChange={(e) => draw.setFillColor(e.target.value)}
                disabled={!draw.fillEnabled}
                style={{ opacity: draw.fillEnabled ? 1 : 0.4 }}
              />
            </div>
          )}
        </div>

        {["rect", "circle"].includes(draw.tool) && (
          <Toggle label="تعبئة الشكل" checked={draw.fillEnabled} onChange={draw.setFillEnabled} />
        )}

        {draw.tool !== "text" && (
          <DialSlider label="سماكة الخط" value={draw.width} min={1} max={40} onChange={draw.setWidth} unit="px" />
        )}

        <div className="field-row">
          <Button onClick={() => canvasRef.current?.undoLast()} disabled={!strokeCount}>
            <Undo2 size={15} />
            تراجع
          </Button>
          <Button onClick={() => canvasRef.current?.clearAll()} disabled={!strokeCount}>
            <Trash2 size={15} />
            مسح الكل
          </Button>
        </div>

        <Button variant="primary" className="btn-block" onClick={handleApply} disabled={!strokeCount}>
          <Check size={16} />
          تطبيق الرسم على الصورة
        </Button>
      </PanelBody>
    </>
  );
}
