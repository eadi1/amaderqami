import React, { useState } from "react";
import "./MonthSelectModal.css";

const months = [
  { name: "জানুয়ারি", value: 1 },
  { name: "ফেব্রুয়ারি", value: 2 },
  { name: "মার্চ", value: 3 },
  { name: "এপ্রিল", value: 4 },
  { name: "মে", value: 5 },
  { name: "জুন", value: 6 },
  { name: "জুলাই", value: 7 },
  { name: "আগস্ট", value: 8 },
  { name: "সেপ্টেম্বর", value: 9 },
  { name: "অক্টোবর", value: 10 },
  { name: "নভেম্বর", value: 11 },
  { name: "ডিসেম্বর", value: 12 },
];

export default function MonthSelectModal({ feeType, onClose, onSubmit }) {
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleSubmit = () => {
    if (!selectedMonth) {
      alert("মাস নির্বাচন করুন!");
      return;
    }
    // 🔹 মাসের numeric value পাঠানো হবে
    onSubmit(Number(selectedMonth));
  };

  return (
    <main className="main-content">
    <div className="modal-overlay">
       
      <div className="modal">
        
        {/* Content */}
        <div className="modal-content">
        <h2 className="modal-title">
          {feeType.name} এর জন্য মাস নির্বাচন করুন
        </h2>
 <div className="modal-form-row">
    <label>মাস</label>
        <select
          className="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">-- মাস নির্বাচন করুন --</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.name}
            </option>
          ))}
        </select>
      </div>









       <div className="modal-actions">
          <button className="btn btn-save" onClick={handleSubmit}>
            💾 সাবমিট
          </button>
          <button className="btn btn-cancel" onClick={onClose}>
            ❌ বাতিল
          </button>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
