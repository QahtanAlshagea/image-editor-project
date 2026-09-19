import React, { useState } from "react";
import { Aperture, Undo2, Redo2, Download, ImagePlus, Menu } from "lucide-react";
import Button from "./ui/Button.jsx";

const FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WEBP" },
  { value: "bmp", label: "BMP" },
  { value: "tiff", label: "TIFF" },
];

export default function TopBar({
  fileName,
  hasImage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onDownload,
  onToggleMobilePanel,
}) {
  const [format, setFormat] = useState("png");

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand__mark">
          <Aperture size={19} />
        </div>
        <div className="brand__text">
          <span className="brand__title">استوديو لومن</span>
          <span className="brand__subtitle">LUMEN STUDIO</span>
        </div>
      </div>

      {hasImage && (
        <div className="topbar__filename">
          <span>ملف:</span>
          <b>{fileName}</b>
        </div>
      )}

      <div className="topbar__spacer" />

      {hasImage && (
        <div className="topbar__actions">
          <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title="تراجع">
            <Undo2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title="إعادة">
            <Redo2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onReset} title="صورة جديدة">
            <ImagePlus size={16} />
          </Button>

          <select
            className="select"
            style={{ width: 92 }}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            title="صيغة التنزيل"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <Button variant="primary" onClick={() => onDownload(format)}>
            <Download size={16} />
            تنزيل
          </Button>

          <Button variant="ghost" size="icon" className="mobile-tabs-toggle" onClick={onToggleMobilePanel} title="الأدوات">
            <Menu size={18} />
          </Button>
        </div>
      )}
    </header>
  );
}
