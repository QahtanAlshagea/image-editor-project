import React, { useState } from "react";
import { FileCog } from "lucide-react";
import { PanelHeader, PanelBody } from "../ui/Panel.jsx";
import DialSlider from "../ui/DialSlider.jsx";
import Button from "../ui/Button.jsx";
import api from "../../api/client.js";

const FORMATS = [
  { value: "png", label: "PNG — شفافية كاملة" },
  { value: "jpeg", label: "JPEG — حجم أصغر" },
  { value: "webp", label: "WEBP — للويب" },
  { value: "bmp", label: "BMP" },
  { value: "gif", label: "GIF" },
  { value: "tiff", label: "TIFF" },
];

export default function ConvertPanel({ editor }) {
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(92);
  const showQuality = format === "jpeg" || format === "webp";

  const handleConvert = () => {
    editor.runEdit(`تحويل إلى ${format.toUpperCase()}`, () => api.convert(editor.current.blob, format, quality));
  };

  return (
    <>
      <PanelHeader
        eyebrow="01 — التحويل"
        title="تحويل صيغة الصورة"
        description="حوّل الصورة إلى أي صيغة تحتاجها مع التحكم بجودة الضغط."
      />
      <PanelBody>
        <div className="field-group">
          <div className="field-label"><span>الصيغة المستهدفة</span></div>
          <select className="select" value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {showQuality && (
          <DialSlider label="الجودة" value={quality} min={10} max={100} onChange={setQuality} unit="%" />
        )}

        <Button variant="primary" className="btn-block" onClick={handleConvert}>
          <FileCog size={16} />
          تحويل الصيغة
        </Button>
      </PanelBody>
    </>
  );
}
