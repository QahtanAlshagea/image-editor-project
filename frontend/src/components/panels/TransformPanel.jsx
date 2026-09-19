import React, { useState } from "react";
import { Crop, Maximize2, RotateCw, RotateCcw, FlipHorizontal2, FlipVertical2 } from "lucide-react";
import { PanelHeader, PanelBody, SectionTitle } from "../ui/Panel.jsx";
import Tabs from "../ui/Tabs.jsx";
import Toggle from "../ui/Toggle.jsx";
import DialSlider from "../ui/DialSlider.jsx";
import Button from "../ui/Button.jsx";
import api from "../../api/client.js";

export default function TransformPanel({ editor, subTab, onSubTabChange, cropRect }) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [angle, setAngle] = useState(0);

  const applyCrop = () => {
    if (!cropRect) return;
    editor.runEdit("قص", () => api.crop(editor.current.blob, cropRect));
  };

  const applyResize = () => {
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (!w || !h) return;
    editor.runEdit("تغيير الحجم", () => api.resize(editor.current.blob, { width: w, height: h, keepAspect }));
  };

  const applyRotate = (customAngle) => {
    const a = customAngle !== undefined ? customAngle : angle;
    editor.runEdit("تدوير", () => api.rotate(editor.current.blob, a, true)).then((result) => {
      if (result) setAngle(0); // only reset the slider once the rotation actually succeeded
    });
  };

  const applyFlip = (direction) => {
    editor.runEdit(direction === "horizontal" ? "قلب أفقي" : "قلب رأسي", () =>
      api.flip(editor.current.blob, direction)
    );
  };

  return (
    <>
      <PanelHeader
        eyebrow="03 — التحويل"
        title="القص والتحويل"
        description="قص، غيّر الحجم، دوّر، أو اقلب الصورة."
      />
      <PanelBody>
        <Tabs
          tabs={[
            { value: "crop", label: "قص" },
            { value: "resize", label: "حجم" },
            { value: "rotate", label: "تدوير" },
            { value: "flip", label: "قلب" },
          ]}
          active={subTab}
          onChange={onSubTabChange}
        />

        {subTab === "crop" && (
          <>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
              حرّك الإطار الظاهر على الصورة أو اسحب الزوايا لتحديد منطقة القص، ثم اضغط تطبيق.
            </p>
            {cropRect && (
              <div className="field-row">
                <div className="field-group">
                  <div className="field-label"><span>العرض</span><span className="field-label__value">{cropRect.width}px</span></div>
                </div>
                <div className="field-group">
                  <div className="field-label"><span>الارتفاع</span><span className="field-label__value">{cropRect.height}px</span></div>
                </div>
              </div>
            )}
            <Button variant="primary" className="btn-block" onClick={applyCrop}>
              <Crop size={16} />
              تطبيق القص
            </Button>
          </>
        )}

        {subTab === "resize" && (
          <>
            <SectionTitle>الأبعاد الجديدة (بكسل)</SectionTitle>
            <div className="field-row">
              <input
                className="select"
                type="number"
                placeholder="العرض"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <input
                className="select"
                type="number"
                placeholder="الارتفاع"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <Toggle label="الحفاظ على النسبة" checked={keepAspect} onChange={setKeepAspect} />
            <Button variant="primary" className="btn-block" onClick={applyResize}>
              <Maximize2 size={16} />
              تطبيق تغيير الحجم
            </Button>
          </>
        )}

        {subTab === "rotate" && (
          <>
            <DialSlider label="زاوية الدوران" value={angle} min={-180} max={180} onChange={setAngle} unit="°" />
            <div className="field-row">
              <Button onClick={() => applyRotate(-90)}>
                <RotateCcw size={15} />
                90° يسار
              </Button>
              <Button onClick={() => applyRotate(90)}>
                <RotateCw size={15} />
                90° يمين
              </Button>
            </div>
            <Button variant="primary" className="btn-block" onClick={() => applyRotate()}>
              تطبيق زاوية مخصصة ({angle}°)
            </Button>
          </>
        )}

        {subTab === "flip" && (
          <div className="field-row">
            <Button className="btn-block" onClick={() => applyFlip("horizontal")}>
              <FlipHorizontal2 size={16} />
              قلب أفقي
            </Button>
            <Button className="btn-block" onClick={() => applyFlip("vertical")}>
              <FlipVertical2 size={16} />
              قلب رأسي
            </Button>
          </div>
        )}
      </PanelBody>
    </>
  );
}
