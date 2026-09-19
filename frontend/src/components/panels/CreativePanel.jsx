import React, { useState } from "react";
import { Wand2, ScanFace, Stamp, Palette } from "lucide-react";
import { PanelHeader, PanelBody } from "../ui/Panel.jsx";
import Tabs from "../ui/Tabs.jsx";
import DialSlider from "../ui/DialSlider.jsx";
import Button from "../ui/Button.jsx";
import api from "../../api/client.js";

export default function CreativePanel({ editor }) {
  const [tab, setTab] = useState("auto");

  const [faceIntensity, setFaceIntensity] = useState(75);
  const [facesFound, setFacesFound] = useState(null);

  const [wmText, setWmText] = useState("علامتك التجارية");
  const [wmPosition, setWmPosition] = useState("bottom-right");
  const [wmOpacity, setWmOpacity] = useState(70);
  const [wmSize, setWmSize] = useState(32);

  const [palette, setPalette] = useState(null);
  const [paletteLoading, setPaletteLoading] = useState(false);

  const runAutoEnhance = () => {
    editor.runEdit("تحسين تلقائي", () => api.autoEnhance(editor.current.blob));
  };

  const runFaceBlur = async () => {
    const fd = new FormData();
    fd.append("image", editor.current.blob, "image.png");
    fd.append("intensity", faceIntensity);
    const res = await fetch("/api/creative/face_blur", { method: "POST", body: fd });
    if (!res.ok) return;
    setFacesFound(res.headers.get("X-Faces-Detected"));
    const blob = await res.blob();
    editor.commitBlob(blob, "تمويه الوجوه");
  };

  const runWatermark = () => {
    editor.runEdit("علامة مائية", () =>
      api.watermark(editor.current.blob, {
        text: wmText,
        position: wmPosition,
        opacity: wmOpacity / 100,
        font_size: wmSize,
      })
    );
  };

  const runPalette = async () => {
    setPaletteLoading(true);
    try {
      const data = await api.palette(editor.current.blob, 6);
      setPalette(data.palette);
    } finally {
      setPaletteLoading(false);
    }
  };

  return (
    <>
      <PanelHeader
        eyebrow="08 — إبداعي"
        title="أدوات إبداعية"
        description="ميزات إضافية: تحسين تلقائي، حماية الخصوصية بتمويه الوجوه، علامة مائية، واستخراج لوحة الألوان."
      />
      <PanelBody>
        <Tabs
          tabs={[
            { value: "auto", label: "تحسين تلقائي" },
            { value: "face", label: "تمويه الوجوه" },
            { value: "watermark", label: "علامة مائية" },
            { value: "palette", label: "الألوان" },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === "auto" && (
          <>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
              ضبط تلقائي بضغطة واحدة: توازن الألوان، التباين، والحدة — مثالي لصور المنتجات السريعة.
            </p>
            <Button variant="primary" className="btn-block" onClick={runAutoEnhance}>
              <Wand2 size={16} />
              تحسين تلقائي بضغطة واحدة
            </Button>
          </>
        )}

        {tab === "face" && (
          <>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
              يكتشف الوجوه في الصورة تلقائياً ويموّهها لحماية الخصوصية.
            </p>
            <DialSlider label="شدة التمويه" value={faceIntensity} min={20} max={100} onChange={setFaceIntensity} unit="%" />
            <Button variant="primary" className="btn-block" onClick={runFaceBlur}>
              <ScanFace size={16} />
              اكتشاف وتمويه الوجوه
            </Button>
            {facesFound !== null && (
              <p style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center" }}>
                تم العثور على {facesFound} وجه/وجوه
              </p>
            )}
          </>
        )}

        {tab === "watermark" && (
          <>
            <div className="field-group">
              <div className="field-label"><span>نص العلامة المائية</span></div>
              <input className="select" type="text" value={wmText} onChange={(e) => setWmText(e.target.value)} />
            </div>
            <div className="field-group">
              <div className="field-label"><span>الموضع</span></div>
              <select className="select" value={wmPosition} onChange={(e) => setWmPosition(e.target.value)}>
                <option value="bottom-right">أسفل اليمين</option>
                <option value="bottom-left">أسفل اليسار</option>
                <option value="top-right">أعلى اليمين</option>
                <option value="top-left">أعلى اليسار</option>
                <option value="center">الوسط</option>
              </select>
            </div>
            <DialSlider label="الشفافية" value={wmOpacity} min={10} max={100} onChange={setWmOpacity} unit="%" />
            <DialSlider label="حجم الخط" value={wmSize} min={14} max={96} onChange={setWmSize} unit="px" />
            <Button variant="primary" className="btn-block" onClick={runWatermark}>
              <Stamp size={16} />
              إضافة العلامة المائية
            </Button>
          </>
        )}

        {tab === "palette" && (
          <>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
              استخراج الألوان السائدة في الصورة — مفيد للتناسق مع هوية المتجر البصرية.
            </p>
            <Button variant="primary" className="btn-block" onClick={runPalette} disabled={paletteLoading}>
              <Palette size={16} />
              {paletteLoading ? "جارِ الاستخراج..." : "استخراج لوحة الألوان"}
            </Button>
            {palette && (
              <>
                <div className="palette-row">
                  {palette.map((c) => (
                    <div
                      key={c.hex}
                      className="palette-swatch"
                      style={{ background: c.hex, flexGrow: c.share * 10 }}
                      title={`${c.hex} — ${Math.round(c.share * 100)}%`}
                      onClick={() => navigator.clipboard?.writeText(c.hex)}
                    />
                  ))}
                </div>
                <div className="palette-hex">
                  {palette.map((c) => (
                    <span key={c.hex}>{c.hex}</span>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </PanelBody>
    </>
  );
}
