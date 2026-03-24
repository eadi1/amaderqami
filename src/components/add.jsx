// src/components/CrudModal.js
import React from "react";

export default function CrudModal({ show, title, fields, data, setData, onClose, onSave }) {
  if (!show) return null;

  const handleChange = (field, e) => {
    if (field.type === "checkbox") {
      setData({ ...data, [field.name]: e.target.checked ? 1 : 0 });
    } else {
      setData({ ...data, [field.name]: e.target.value });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="trail"></div>
         <div className="trail1"></div>
        <h2>{title}</h2>
        <div className="modal-content">
          {fields.map((field) => {
            if (field.type === "checkbox") {
              return (
                <label key={field.name} style={{ display: "block", margin: "8px 0" }}>
                  <input
                    type="checkbox"
                    checked={!!data[field.name]}
                    onChange={(e) => handleChange(field, e)}
                  />{" "}
                  {field.label}
                </label>
              );
            }

            if (field.type === "select") {
              return (
                <label key={field.name} style={{ display: "block", margin: "8px 0" }}>
                  {field.label}
                  <select
                    value={data[field.name]}
                    onChange={(e) => handleChange(field, e)}
                    disabled={field.disabled}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <input
                key={field.name}
                type={field.type || "text"}
                value={data[field.name]}
                placeholder={field.placeholder}
                onChange={(e) => handleChange(field, e)}
                style={{ display: "block", margin: "8px 0", padding: "6px", width: "100%" }}
              />
            );
          })}
            <div className="modal-actions" style={{ marginTop: "16px" }}>
          <button onClick={onSave} className="btn btn-save">
            💾 Save
          </button>
          <button onClick={onClose} className="btn btn-cancel">
            ❌ Cancel
          </button>
        </div>
        </div>

      
      </div>
    </div>
  );
}
