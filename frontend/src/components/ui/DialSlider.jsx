import React from "react";

/**
 * The app's signature control: an "aperture ring" slider. Visually it is a
 * styled <input type="range"> (see .dial-slider in index.css) whose thumb
 * is rendered with a conic-gradient to look like a lens iris, and whose
 * track fill communicates the current value at a glance.
 */
export default function DialSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  formatValue,
  unit = "",
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <div className="field-group">
      <div className="field-label">
        <span>{label}</span>
        <span className="field-label__value">{display}</span>
      </div>
      <div className="dial-slider">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ "--pct": pct }}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
