import React from "react";

export default function HistoryStrip({ history, index, onJump }) {
  if (history.length < 2) return null;

  return (
    <div className="history-strip">
      {history.map((entry, i) => (
        <button
          key={entry.id}
          type="button"
          className={`history-chip${i === index ? " is-current" : ""}`}
          onClick={() => onJump(i)}
        >
          <img src={entry.url} alt={entry.label} />
          <span>{entry.label}</span>
        </button>
      ))}
    </div>
  );
}
