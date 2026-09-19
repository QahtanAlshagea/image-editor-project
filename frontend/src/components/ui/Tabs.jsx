import React from "react";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="panel-tabs">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          className={`panel-tab${active === t.value ? " is-active" : ""}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
