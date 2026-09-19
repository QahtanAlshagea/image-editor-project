import React, { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { PanelHeader, PanelBody, SectionTitle } from "../ui/Panel.jsx";
import DialSlider from "../ui/DialSlider.jsx";
import Button from "../ui/Button.jsx";
import api from "../../api/client.js";
import useLivePreview from "../../hooks/useLivePreview.js";

const FILTERS = [
  { id: "blur", label: "تنعيم" },
  { id: "sharpen", label: "تحديد" },
  { id: "edge", label: "كشف الحواف" },
  { id: "grayscale", label: "أبيض وأسود" },
  { id: "sepia", label: "بني داكن" },
  { id: "invert", label: "عكس الألوان" },
  { id: "vintage", label: "كلاسيكي" },
  { id: "cartoon", label: "كرتوني" },
  { id: "emboss", label: "نقش بارز" },
  { id: "posterize", label: "تلوين مسطح" },
];

export default function FiltersPanel({ editor, onPreviewUrl }) {
  const [active, setActive] = useState(null);
  const [intensity, setIntensity] = useState(60);
  const preview = useLivePreview({ onPreviewUrl });

  useEffect(() => () => preview.cancel(), [editor.current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (id) => {
    setActive(id);
    preview.request(() => api.applyFilter(editor.current.blob, id, intensity));
  };

  const updateIntensity = (v) => {
    setIntensity(v);
    if (active) preview.request(() => api.applyFilter(editor.current.blob, active, v));
  };

  const applyFilter = () => {
    const blob = preview.getBlob();
    if (blob) {
      const label = FILTERS.find((f) => f.id === active)?.label || "فلتر";
      editor.commitBlob(blob, label);
      preview.cancel();
      setActive(null);
    }
  };

  const cancel = () => {
    setActive(null);
    preview.cancel();
  };

  return (
    <>
      <PanelHeader
        eyebrow="05 — الفلاتر"
        title="الفلاتر الإبداعية"
        description="اختر فلتراً واضبط شدته، ثم طبّقه على الصورة."
      />
      <PanelBody>
        <SectionTitle>الفلاتر المتاحة</SectionTitle>
        <div className="filter-grid">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-tile${active === f.id ? " is-active" : ""}`}
              onClick={() => select(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {active && (
          <>
            <DialSlider label="الشدة" value={intensity} min={0} max={100} onChange={updateIntensity} unit="%" />
            <div className="field-row">
              <Button onClick={cancel}>
                <RotateCcw size={15} />
                إلغاء
              </Button>
              <Button variant="primary" onClick={applyFilter} disabled={!preview.isPreviewing}>
                <Check size={15} />
                تطبيق الفلتر
              </Button>
            </div>
          </>
        )}
      </PanelBody>
    </>
  );
}
