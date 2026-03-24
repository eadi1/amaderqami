import React from "react";
import "./feeDisplayCard.css";

export default function FeeDisplayCard({ fee }) {
  // ✅ Bangla month mapping
  const banglaMonths = {
    jan: "জানুয়ারি", feb: "ফেব্রুয়ারি", mar: "মার্চ", apr: "এপ্রিল",
    may: "মে", jun: "জুন", jul: "জুলাই", aug: "আগস্ট",
    sep: "সেপ্টেম্বর", oct: "অক্টোবর", nov: "নভেম্বর", dec: "ডিসেম্বর"
  };

  return (
    <div className="fee-display-card">
      <div className="fee-title">
        <span className="icon">💳</span> {fee.fee_type_name}
      </div>

      <div className="fee-table">
        {fee.months && Object.entries(fee.months).map(([month, amount]) => {
          const monthKey = month.toLowerCase(); // যাতে ডাটা ফরম্যাট যাই হোক ম্যাচ করে
          const isPaid = parseFloat(amount) > 0;

          return (
            <div className="fee-row" key={month}>
              <span className="fee-month">
                {banglaMonths[monthKey] || month}
              </span>
              <span className={`fee-status-badge ${isPaid ? "paid" : "due"}`}>
                {isPaid ? `৳${amount}` : "বকেয়া"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}