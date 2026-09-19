import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast toast--error" role="alert">
      <AlertTriangle size={17} />
      <span>{message}</span>
      <button type="button" className="btn-ghost btn-icon" style={{ width: 22, height: 22, padding: 0 }} onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
