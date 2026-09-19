import React, { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { PanelHeader, PanelBody, SectionTitle } from "../ui/Panel.jsx";
import DialSlider from "../ui/DialSlider.jsx";
import Button from "../ui/Button.jsx";
import api from "../../api/client.js";
import useLivePreview from "../../hooks/useLivePreview.js";

const NEUTRAL = {
  brightness: 1, contrast: 1, saturation: 1, sharpness: 1,
  exposure: 0, gamma_shift: 0, temperature: 0, tint: 0,
};

export default function EnhancePanel({ editor, onPreviewUrl }) {
  const [params, setParams] = useState(NEUTRAL);
  const preview = useLivePreview({ onPreviewUrl });

  useEffect(() => () => preview.cancel(), [editor.current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (key, value) => {
    const next = { ...params, [key]: value };
    setParams(next);
    preview.request(() => api.enhancePixel(editor.current.blob, next));
  };

  const applyAll = () => {
    const blob = preview.getBlob();
    if (blob) {
      editor.commitBlob(blob, "تحسين البكسل");
      preview.cancel();
      setParams(NEUTRAL);
    }
  };

  const resetAll = () => {
    setParams(NEUTRAL);
    preview.cancel();
  };

  const pct = (v) => `${Math.round(v * 100)}%`;
  const signed = (v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2));

  return (
    <>
      <PanelHeader
        eyebrow="04 — تحسين البكسل"
        title="تحسين البكسل"
        description="ضبط دقيق على مستوى البكسل: السطوع، التباين، التشبع، التعريض، ودرجة الحرارة."
      />
      <PanelBody>
        <SectionTitle>أساسي</SectionTitle>
        <DialSlider label="السطوع" value={params.brightness} min={0} max={2} step={0.01} onChange={(v) => update("brightness", v)} formatValue={pct} />
        <DialSlider label="التباين" value={params.contrast} min={0} max={2} step={0.01} onChange={(v) => update("contrast", v)} formatValue={pct} />
        <DialSlider label="التشبع اللوني" value={params.saturation} min={0} max={2} step={0.01} onChange={(v) => update("saturation", v)} formatValue={pct} />
        <DialSlider label="الحدة" value={params.sharpness} min={0} max={2} step={0.01} onChange={(v) => update("sharpness", v)} formatValue={pct} />

        <SectionTitle>متقدم</SectionTitle>
        <DialSlider label="التعريض الضوئي" value={params.exposure} min={-1} max={1} step={0.01} onChange={(v) => update("exposure", v)} formatValue={signed} />
        <DialSlider label="مستوى الجاما" value={params.gamma_shift} min={-0.8} max={0.8} step={0.01} onChange={(v) => update("gamma_shift", v)} formatValue={signed} />
        <DialSlider label="درجة الحرارة (دافئ/بارد)" value={params.temperature} min={-1} max={1} step={0.01} onChange={(v) => update("temperature", v)} formatValue={signed} />
        <DialSlider label="الصبغة (أخضر/ماجنتا)" value={params.tint} min={-1} max={1} step={0.01} onChange={(v) => update("tint", v)} formatValue={signed} />

        <div className="field-row">
          <Button onClick={resetAll}>
            <RotateCcw size={15} />
            إعادة ضبط
          </Button>
          <Button variant="primary" onClick={applyAll} disabled={!preview.isPreviewing}>
            <Check size={15} />
            تطبيق
          </Button>
        </div>
      </PanelBody>
    </>
  );
}
