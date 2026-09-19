import React from "react";
import { TOOLS } from "../constants/tools.js";

export default function Sidebar({ activeTool, onSelect }) {
  return (
    <nav className="tool-rail">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            type="button"
            className={`tool-rail__btn${activeTool === tool.id ? " is-active" : ""}`}
            onClick={() => onSelect(tool.id)}
            title={tool.label}
          >
            <Icon size={19} />
            <span>{tool.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
