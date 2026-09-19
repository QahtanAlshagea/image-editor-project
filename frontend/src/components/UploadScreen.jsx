import React, { useCallback, useRef, useState } from "react";
import { Aperture, UploadCloud } from "lucide-react";

export default function UploadScreen({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (file && file.type.startsWith("image/")) onFile(file);
    },
    [onFile]
  );

  return (
    <div className="upload-screen">
      <div
        className={`upload-card${dragging ? " is-dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="upload-aperture">
          <Aperture size={40} />
        </div>
        <h2>استوديو لومن لتحرير الصور</h2>
        <p>
          اسحب صورة وأفلتها هنا، أو اختر ملفاً من جهازك للبدء — تحويل صيغ، إزالة خلفية،
          رسم، فلاتر، ودمج صور، كل ذلك في مكان واحد.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()}>
          <UploadCloud size={17} />
          اختيار صورة
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="upload-hint">PNG · JPEG · WEBP · BMP · GIF · TIFF — حتى 25MB</div>
      </div>
    </div>
  );
}
