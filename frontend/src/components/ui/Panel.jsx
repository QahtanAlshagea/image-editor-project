import React from "react";

export function PanelHeader({ eyebrow, title, description }) {
  return (
    <div className="panel-header">
      {eyebrow && <div className="panel-header__eyebrow">{eyebrow}</div>}
      <h3 className="panel-header__title">{title}</h3>
      {description && <p className="panel-header__desc">{description}</p>}
    </div>
  );
}

export function PanelBody({ children }) {
  return <div className="panel-body">{children}</div>;
}

export function PanelEmpty({ children }) {
  return <div className="panel-empty">{children}</div>;
}

export function SectionTitle({ children }) {
  return <div className="panel-section-title">{children}</div>;
}
