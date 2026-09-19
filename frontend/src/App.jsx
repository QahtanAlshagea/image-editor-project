import React, { useCallback, useRef, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import CanvasStage from "./components/CanvasStage.jsx";
import HistoryStrip from "./components/HistoryStrip.jsx";
import UploadScreen from "./components/UploadScreen.jsx";
import Toast from "./components/Toast.jsx";

import ConvertPanel from "./components/panels/ConvertPanel.jsx";
import BackgroundPanel from "./components/panels/BackgroundPanel.jsx";
import TransformPanel from "./components/panels/TransformPanel.jsx";
import EnhancePanel from "./components/panels/EnhancePanel.jsx";
import FiltersPanel from "./components/panels/FiltersPanel.jsx";
import DrawPanel from "./components/panels/DrawPanel.jsx";
import MergePanel from "./components/panels/MergePanel.jsx";
import CreativePanel from "./components/panels/CreativePanel.jsx";

import useImageEditor from "./hooks/useImageEditor.js";
import api from "./api/client.js";

export default function App() {
  const editor = useImageEditor();
  const [activeTool, setActiveTool] = useState("convert");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  // A temporary preview (from Enhance/Filters/Merge panels) that overrides
  // the committed history image on the canvas, without touching history.
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- Transform (crop) state ---
  const [transformSubTab, setTransformSubTab] = useState("crop");
  const [cropRect, setCropRect] = useState(null);

  // --- Draw state ---
  const drawCanvasRef = useRef(null);
  const [drawResetKey, setDrawResetKey] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [drawState, setDrawState] = useState({
    tool: "pen",
    color: "#e8a33d",
    width: 6,
    fillEnabled: false,
    fillColor: "#e8a33d",
    fillOpacity: 0.35,
    textValue: "",
    fontSize: 28,
  });
  const draw = {
    ...drawState,
    setTool: (v) => setDrawState((s) => ({ ...s, tool: v })),
    setColor: (v) => setDrawState((s) => ({ ...s, color: v })),
    setWidth: (v) => setDrawState((s) => ({ ...s, width: v })),
    setFillEnabled: (v) => setDrawState((s) => ({ ...s, fillEnabled: v })),
    setFillColor: (v) => setDrawState((s) => ({ ...s, fillColor: v })),
    setFillOpacity: (v) => setDrawState((s) => ({ ...s, fillOpacity: v })),
    setTextValue: (v) => setDrawState((s) => ({ ...s, textValue: v })),
    setFontSize: (v) => setDrawState((s) => ({ ...s, fontSize: v })),
  };

  const handleFile = useCallback(
    (file) => {
      editor.loadInitial(file, file.name);
    },
    [editor]
  );

  const handleSelectTool = (toolId) => {
    setActiveTool(toolId);
    setPreviewUrl(null);
    setMobilePanelOpen(true);
  };

  const handleReset = () => {
    editor.reset();
    setPreviewUrl(null);
  };

  const handleDownload = async (format) => {
    if (!editor.current) return;
    try {
      const blob = await api.convert(editor.current.blob, format, 95);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${editor.fileName}.${format === "jpeg" ? "jpg" : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      editor.setError(e.message);
    }
  };

  const displayedUrl = previewUrl || editor.current?.url;

  return (
    <div className="app-shell">
      <div className="grain-overlay" />
      <TopBar
        fileName={editor.fileName}
        hasImage={!!editor.current}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onReset={handleReset}
        onDownload={handleDownload}
        onToggleMobilePanel={() => setMobilePanelOpen((v) => !v)}
      />

      {!editor.current ? (
        <UploadScreen onFile={handleFile} />
      ) : (
        <div className="workspace">
          <Sidebar activeTool={activeTool} onSelect={handleSelectTool} />

          <div className="stage-area">
            <div className="stage-toolbar">
              <span>
                {editor.history.length > 1 ? `الخطوة ${editor.index + 1} من ${editor.history.length}` : "الصورة الأصلية"}
              </span>
              <span>استوديو لومن لتحرير الصور الاحترافي</span>
            </div>

            <CanvasStage
              imageUrl={displayedUrl}
              busy={editor.busy}
              busyLabel={editor.busyLabel}
              cropEnabled={activeTool === "transform" && transformSubTab === "crop"}
              onCropChange={setCropRect}
              cropResetKey={`${editor.index}`}
              drawEnabled={activeTool === "draw"}
              drawCanvasRef={drawCanvasRef}
              drawTool={draw.tool}
              drawColor={draw.color}
              drawWidth={draw.width}
              drawFillEnabled={draw.fillEnabled}
              drawFillColor={draw.fillColor}
              drawFillOpacity={draw.fillOpacity}
              drawTextValue={draw.textValue}
              drawFontSize={draw.fontSize}
              drawResetKey={`${editor.index}-${drawResetKey}`}
              onDrawCountChange={setStrokeCount}
            />

            <HistoryStrip history={editor.history} index={editor.index} onJump={editor.jumpTo} />
          </div>

          <div className={`side-panel${mobilePanelOpen ? " is-open" : ""}`}>
            {activeTool === "convert" && <ConvertPanel editor={editor} />}
            {activeTool === "background" && <BackgroundPanel editor={editor} />}
            {activeTool === "transform" && (
              <TransformPanel
                editor={editor}
                subTab={transformSubTab}
                onSubTabChange={setTransformSubTab}
                cropRect={cropRect}
              />
            )}
            {activeTool === "enhance" && <EnhancePanel editor={editor} onPreviewUrl={setPreviewUrl} />}
            {activeTool === "filters" && <FiltersPanel editor={editor} onPreviewUrl={setPreviewUrl} />}
            {activeTool === "draw" && (
              <DrawPanel
                editor={editor}
                draw={draw}
                canvasRef={drawCanvasRef}
                strokeCount={strokeCount}
                onApplied={() => setDrawResetKey((k) => k + 1)}
              />
            )}
            {activeTool === "merge" && <MergePanel editor={editor} onPreviewUrl={setPreviewUrl} />}
            {activeTool === "creative" && <CreativePanel editor={editor} />}
          </div>

          <div
            className={`side-panel-backdrop${mobilePanelOpen ? " is-open" : ""}`}
            onClick={() => setMobilePanelOpen(false)}
          />
        </div>
      )}

      <Toast message={editor.error} onClose={() => editor.setError(null)} />
    </div>
  );
}
