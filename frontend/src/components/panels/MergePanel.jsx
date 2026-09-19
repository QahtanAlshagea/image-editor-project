import React, { useEffect, useRef, useState } from "react";
import { Upload, Check, RotateCcw } from "lucide-react";
import { PanelHeader, PanelBody, SectionTitle, PanelEmpty } from "../ui/Panel.jsx";
import DialSlider from "../ui/DialSlider.jsx";
import Button from "../ui/Button.jsx";
import api from "../../api/client.js";
import useLivePreview from "../../hooks/useLivePreview.js";

const BLEND_MODES = [
  { value: "normal", label: "عادي" },
  { value: "multiply", label: "ضرب (Multiply)" },
  { value: "screen", label: "شاشة (Screen)" },
  { value: "overlay", label: "تراكب (Overlay)" },
  { value: "darken", label: "تغميق" },
  { value: "lighten", label: "تفتيح" },
];

export default function MergePanel({ editor, onPreviewUrl }) {
  const [overlayFile, setOverlayFile] = useState(null);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [scale, setScale] = useState(60);
  const [opacity, setOpacity] = useState(100);
  const [blendMode, setBlendMode] = useState("normal");
  const inputRef = useRef(null);
  const preview = useLivePreview({ onPreviewUrl });

  useEffect(() => () => preview.cancel(), [editor.current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const runPreview = (overrides = {}, fileOverride = null) => {
    const file = fileOverride || overlayFile;
    if (!file) return;
    const params = { x, y, scale: scale / 100, opacity: opacity / 100, blend_mode: blendMode, ...overrides };
    preview.request(() => api.merge(editor.current.blob, file, params));
  };

  const setAndPreview = (setter, key) => (value) => {
    setter(value);
    const overrides = {};
    if (key === "scale" || key === "opacity") overrides[key] = value / 100;
    else overrides[key] = value;
    runPreview(overrides);
  };

  const applyMerge = () => {
    const blob = preview.getBlob();
    if (blob) {
      editor.commitBlob(blob, "دمج صورتين");
      preview.cancel();
      setOverlayFile(null);
    }
  };

  const cancel = () => {
    setOverlayFile(null);
    preview.cancel();
  };

  return (
    <>
      <PanelHeader
        eyebrow="07 — الدمج"
        title="دمج صورتين"
        description="ارفع صورة ثانية وضعها فوق الصورة الحالية بالحجم والشفافية ونمط الدمج الذي تريد."
      />
      <PanelBody>
        <Button variant="ghost" className="btn-block" onClick={() => inputRef.current?.click()}>
          <Upload size={15} />
          {overlayFile ? overlayFile.name : "اختر الصورة الثانية"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setOverlayFile(f);
              runPreview({}, f);
            }
          }}
        />

        {!overlayFile && <PanelEmpty>اختر صورة ثانية للبدء بالدمج</PanelEmpty>}

        {overlayFile && (
          <>
            <SectionTitle>الوضع والشفافية</SectionTitle>
            <DialSlider label="الموضع الأفقي" value={x} min={0} max={100} onChange={setAndPreview(setX, "x")} unit="%" />
            <DialSlider label="الموضع الرأسي" value={y} min={0} max={100} onChange={setAndPreview(setY, "y")} unit="%" />
            <DialSlider label="الحجم" value={scale} min={5} max={200} onChange={setAndPreview(setScale, "scale")} unit="%" />
            <DialSlider label="الشفافية" value={opacity} min={0} max={100} onChange={setAndPreview(setOpacity, "opacity")} unit="%" />

            <div className="field-group">
              <div className="field-label"><span>نمط الدمج (Blend Mode)</span></div>
              <select
                className="select"
                value={blendMode}
                onChange={(e) => {
                  setBlendMode(e.target.value);
                  runPreview({ blend_mode: e.target.value });
                }}
              >
                {BLEND_MODES.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <Button onClick={cancel}>
                <RotateCcw size={15} />
                إلغاء
              </Button>
              <Button variant="primary" onClick={applyMerge} disabled={!preview.isPreviewing}>
                <Check size={15} />
                تطبيق الدمج
              </Button>
            </div>
          </>
        )}
      </PanelBody>
    </>
  );
}
