import React, { useEffect, useRef, useState } from "react";
import { Eraser, ImageDown, Upload } from "lucide-react";
import { PanelHeader, PanelBody, SectionTitle } from "../ui/Panel.jsx";
import Tabs from "../ui/Tabs.jsx";
import Toggle from "../ui/Toggle.jsx";
import DialSlider from "../ui/DialSlider.jsx";
import Button from "../ui/Button.jsx";
import api from "../../api/client.js";

export default function BackgroundPanel({ editor }) {
  const [tab, setTab] = useState("remove");

  // remove tab
  const [shadow, setShadow] = useState(true);

  // library tab
  const [backgrounds, setBackgrounds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [customFile, setCustomFile] = useState(null);
  const [x, setX] = useState(50);
  const [y, setY] = useState(58);
  const [scale, setScale] = useState(90);
  const [libShadow, setLibShadow] = useState(true);
  const [autoRemove, setAutoRemove] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.backgroundLibrary().then((data) => setBackgrounds(data.backgrounds)).catch(() => {});
  }, []);

  const handleRemove = () => {
    editor.runEdit("إزالة الخلفية", () => api.removeBackground(editor.current.blob, shadow));
  };

  const handleApplyBackground = () => {
    if (!selectedId && !customFile) return;
    editor.runEdit("خلفية منتج", () =>
      api.applyBackground(editor.current.blob, {
        backgroundId: selectedId,
        backgroundFile: customFile,
        x,
        y,
        scale: scale / 100,
        shadow: libShadow,
        autoRemove,
      })
    );
  };

  return (
    <>
      <PanelHeader
        eyebrow="02 — الخلفية"
        title="الخلفية"
        description="أزل الخلفية بضغطة واحدة، أو ضع منتجك على خلفية استوديو جاهزة."
      />
      <PanelBody>
        <Tabs
          tabs={[
            { value: "remove", label: "إزالة الخلفية" },
            { value: "library", label: "خلفية المنتج" },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === "remove" && (
          <>
            <Toggle label="إضافة ظل ناعم أسفل العنصر" checked={shadow} onChange={setShadow} />
            <Button variant="primary" className="btn-block" onClick={handleRemove}>
              <Eraser size={16} />
              إزالة الخلفية تلقائياً
            </Button>
          </>
        )}

        {tab === "library" && (
          <>
            <SectionTitle>مكتبة الخلفيات</SectionTitle>
            <div className="bg-grid">
              {backgrounds.map((bg) => (
                <button
                  type="button"
                  key={bg.id}
                  className={`bg-tile${selectedId === bg.id ? " is-selected" : ""}`}
                  style={{ backgroundImage: `url(${bg.thumbnail_url})` }}
                  onClick={() => {
                    setSelectedId(bg.id);
                    setCustomFile(null);
                  }}
                >
                  <span className="bg-tile__label">{bg.name}</span>
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              className="btn-block"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={15} />
              {customFile ? customFile.name : "أو ارفع خلفية مخصصة"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setCustomFile(f);
                  setSelectedId(null);
                }
              }}
            />

            <SectionTitle>وضع المنتج</SectionTitle>
            <DialSlider label="الموضع الأفقي" value={x} min={0} max={100} onChange={setX} unit="%" />
            <DialSlider label="الموضع الرأسي" value={y} min={0} max={100} onChange={setY} unit="%" />
            <DialSlider label="الحجم" value={scale} min={20} max={150} onChange={setScale} unit="%" />

            <Toggle label="إزالة خلفية المنتج تلقائياً" checked={autoRemove} onChange={setAutoRemove} />
            <Toggle label="إضافة ظل" checked={libShadow} onChange={setLibShadow} />

            <Button
              variant="primary"
              className="btn-block"
              disabled={!selectedId && !customFile}
              onClick={handleApplyBackground}
            >
              <ImageDown size={16} />
              تطبيق الخلفية
            </Button>
          </>
        )}
      </PanelBody>
    </>
  );
}
