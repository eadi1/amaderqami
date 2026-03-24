import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiManager from "../apimanger";
import { toast, ToastContainer } from "react-toastify";

export default function SingleStudentAdvanceDue() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [feeTypes, setFeeTypes] = useState([]);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    loadFeeTypes();
  }, []);

  const loadFeeTypes = async () => {
    const res = await ApiManager.get("/accounting/fee-types");
    setFeeTypes(res);
  };

  const handleAddFee = () => {
    setFees([
      ...fees,
      {
        fee_type_id: "",
        amount: "",
        is_recurring: 0,
        preallocated: 0,
        month: "",
      },
    ]);
  };

  const handleFeeTypeChange = (index, feeTypeId) => {
    const ft = feeTypes.find((f) => f.id == feeTypeId);
    const copy = [...fees];

    copy[index] = {
      ...copy[index],
      fee_type_id: feeTypeId,
      is_recurring: ft?.is_recurring || 0,
      preallocated: ft?.preallocated || 0,
      amount: ft?.preallocated === 1 ? ft.amount || 0 : "",
      month: ft?.is_recurring === 1 ? "" : null,
    };

    setFees(copy);
  };

  const handleChange = (i, field, value) => {
    const copy = [...fees];
    copy[i][field] = value;
    setFees(copy);
  };

  const handleSubmit = async () => {
    if (fees.length === 0) {
      return toast.warning("কমপক্ষে একটি ফি যোগ করুন");
    }

    for (const f of fees) {
      if (!f.fee_type_id) {
        return toast.warning("সব ফি টাইপ নির্বাচন করুন");
      }
      if (f.is_recurring === 1 && !f.month) {
        return toast.warning("Recurring ফি এর জন্য মাস নির্বাচন করুন");
      }
    }

    try {
      await ApiManager.post("/accounting/single-student-multiple-due", {
        student_id: studentId,
        fees: fees.map((f) => ({
          fee_type_id: f.fee_type_id,
          amount: f.amount,
          month: f.is_recurring === 1 ? f.month : null,
        })),
      });

      toast.success("Advance Due সফলভাবে যোগ হয়েছে ✅");
      navigate(-1);
    } catch (e) {
      toast.error("ডিউ যোগ করতে সমস্যা হয়েছে!");
    }
  };

  return (
    <main className="main-container">
      <ToastContainer />
      <h2>➕ Advance / Individual Due</h2>

      <p>
        Student ID: <b>{studentId}</b>
      </p>

      <hr />

      {fees.map((f, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 10,
            borderRadius: 6,
          }}
        >
          <select
            value={f.fee_type_id}
            onChange={(e) => handleFeeTypeChange(i, e.target.value)}
          >
            <option value="">-- Fee Type --</option>
            {feeTypes.map((ft) => (
              <option key={ft.id} value={ft.id}>
                {ft.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={f.amount}
            disabled={f.preallocated === 1}
            onChange={(e) => handleChange(i, "amount", e.target.value)}
            style={{ marginLeft: 10 }}
          />

          {/* ✅ Month only if recurring */}
          {f.is_recurring === 1 && (
            <select
              style={{ marginLeft: 10 }}
              value={f.month || ""}
              onChange={(e) => handleChange(i, "month", e.target.value)}
            >
              <option value="">-- মাস নির্বাচন করুন --</option>
        <option value="1">জানুয়ারি</option>
        <option value="2">ফেব্রুয়ারি</option>
        <option value="3">মার্চ</option>
        <option value="4">এপ্রিল</option>
        <option value="5">মে</option>
        <option value="6">জুন</option>
        <option value="7">জুলাই</option>
        <option value="8">আগস্ট</option>
        <option value="9">সেপ্টেম্বর</option>
        <option value="10">অক্টোবর</option>
        <option value="11">নভেম্বর</option>
        <option value="12">ডিসেম্বর</option>
            
            </select>
          )}
        </div>
      ))}

      <button className="btn btn-info" onClick={handleAddFee}>
        ➕ Add Fee
      </button>

      <br />
      <br />

      <button className="btn btn-success" onClick={handleSubmit}>
        💾 Save Advance Due
      </button>
    </main>
  );
}
