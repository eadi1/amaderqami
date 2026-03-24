import React from "react";

export default function IslamicCard({ title, value, icon }) {
  return (
    <div className="islamic-card">
      <div className="islamic-card-inner">
        <div className="islamic-card-text">
          <h1 className="islamic-card-title">{title}</h1>
          {value && <p className="islamic-card-value">{value}</p>}
        </div>
        <div className="islamic-card-icon">{icon}</div>
      </div>
    </div>
  );
}
