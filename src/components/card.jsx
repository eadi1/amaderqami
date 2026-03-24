import React from "react";

export default function Card({ title, amount, icon }) {
  return (
    <div className="card">
      <div>
        <p className="card-title">{title}</p>
        <p className="card-amount">{amount} Tk</p>
      </div>
      <div className="card-icon">{icon}</div>
    </div>
  );
}
