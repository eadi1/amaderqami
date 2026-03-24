import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import FeeCardTable from "../components/FeeCardTable";
import Section from "../components/Section";

export default function StudentPaymentCollection() {
  const [studentId, setStudentId] = useState("");
  const [dues, setDues] = useState([]);
  const [checkedFees, setCheckedFees] = useState({});
  const [receiptBooks, setReceiptBooks] = useState([]);
  const [selectedBoi, setSelectedBoi] = useState("");
  const [availablePages, setAvailablePages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fees, setFees] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [extraFees, setExtraFees] = useState([]); 
  const [studentPricing, setStudentPricing] = useState({});
const [studentDetails, setStudentDetails] = useState(null);

  const navigate = useNavigate();

  const banglaMonths = [
    "", "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];

  useEffect(() => {
    fetchReceiptBooks();
    const savedStudentId = localStorage.getItem("fee-c-studentId");
    if (savedStudentId) setStudentId(savedStudentId);
  }, []);

  const fetchReceiptBooks = async () => {
    try {
      const res = await ApiManager.get("/receipt-book/list");
      setReceiptBooks(res.data || res);
    } catch (err) {
      toast.error("রশিদ বই লোড করতে সমস্যা হয়েছে!");
    }
  };

  // --- নতুন ফি রো হ্যান্ডলিং ---
  const addNewRow = () => {
    if (!studentId) return toast.warning("আগে স্টুডেন্ট আইডি অনুসন্ধান করুন");
    setExtraFees([...extraFees, { 
      tempId: Date.now(), 
      fee_type_id: "", 
      month: 0, 
      amount: 0, 
      paid_amount: 0, 
      discount_amount: 0, 
      fund: 1,
      student_id: studentId 
    }]);
  };

  const removeExtraRow = (tempId) => {
    setExtraFees(extraFees.filter(f => f.tempId !== tempId));
  };

  const handleExtraFeeChange = (tempId, field, value) => {
    setExtraFees(prev => prev.map(f => {
      if (f.tempId === tempId) {
        let updated = { ...f, [field]: value };

        if (field === "fee_type_id") {
          const selectedType = feeTypes.find(t => t.id === parseInt(value));
          if (selectedType) {
            let baseAmount = selectedType.preallocated === 1 
              ? parseFloat(studentPricing[selectedType.db_col] || 0) 
              : parseFloat(selectedType.amount);
              
            updated.amount = baseAmount;
            updated.paid_amount = baseAmount;
            updated.fund = selectedType.fund;
            updated.month = selectedType.is_recurring === 1 ? new Date().getMonth() + 1 : 0;
          }
        }

        const total = Number(updated.paid_amount) + Number(updated.discount_amount);
        if (total > updated.amount) {
          toast.warn("পরিশোধ ও ছাড় মোট টাকার বেশি হতে পারবে না");
          if (field === "paid_amount") updated.paid_amount = updated.amount - updated.discount_amount;
          if (field === "discount_amount") updated.discount_amount = updated.amount - updated.paid_amount;
        }
        return updated;
      }
      return f;
    }));
  };

  const handleSearch = async () => {
    if (!studentId) return toast.warning("স্টুডেন্ট আইডি দিন");
    try {
      localStorage.setItem("fee-c-studentId", studentId);
      setLoading(true);
      const [res, feeRes, feeTypesRes, pricingRes, studentDetailsRes] = await Promise.all([
        ApiManager.get(`/accounting/student-fees/due?student_id=${studentId}`),
        ApiManager.get(`/accounting/fees/card/${studentId}`),
        ApiManager.get("/accounting/fee-types"),
        ApiManager.get(`/accounting/preallocated-fees/${studentId}`),
        ApiManager.get(`/student/${studentId}`)
      ]);

      setStudentDetails(studentDetailsRes.data || studentDetailsRes);
      setFees(feeRes || []);
      setDues(res.data.filter((d) => parseFloat(d.due_amount) > 0) || []);
      setFeeTypes(feeTypesRes.data || feeTypesRes);
      setStudentPricing(pricingRes.data?.db_col || pricingRes.db_col || {});
      setCheckedFees({});
      setExtraFees([]);
    } catch (err) {
      toast.error("ডেটা লোড করতে সমস্যা!");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (id, amount, discount = 0) => {
    setCheckedFees((prev) => {
      const isChecked = !prev[id]?.checked;
      return {
        ...prev,
        [id]: { checked: isChecked, amount: isChecked ? amount : 0, discount: isChecked ? discount : 0 },
      };
    });
  };

  const handleSubmit = async () => {
    const selectedDues = Object.entries(checkedFees)
      .filter(([_, val]) => val.checked)
      .map(([id, val]) => ({ student_fee_id: id, paid_amount: val.amount, discount_amount: val.discount }));

    const notDuesMapped = extraFees.filter(f => f.fee_type_id).map(f => ({
      student_id: f.student_id,
      fee_type_id: f.fee_type_id,
      month: f.month,
      amount: f.amount,
      paid_amount: f.paid_amount,
      discount_amount: f.discount_amount,
      fund: f.fund
    }));

    if (!selectedDues.length && !notDuesMapped.length) return toast.warning("কোনো ফি নির্বাচন করা হয়নি");
    if (!selectedBoi) return toast.warning("রশিদ বই নির্বাচন করুন");
    if (!selectedPage) return toast.warning("পৃষ্ঠা নম্বর নির্বাচন করুন");

    try {
      await ApiManager.post("/accounting/payments", {
        fees: selectedDues,
        notduesfees: notDuesMapped,
        boi_number: selectedBoi,
        roshid_number: selectedPage,
        payment_method: "cash",
      });

      toast.success("পেমেন্ট সফলভাবে নেওয়া হয়েছে ✅");
      navigate(`/pdf_reciet/${selectedBoi}/${selectedPage}`);
    } catch (err) {
      toast.error("Payment নেওয়ার সময় সমস্যা হয়েছে!");
    }
  };
const handleBookChange = (boiNumber) => {
  setSelectedBoi(boiNumber);
  setSelectedPage("");

  // ডাটা টাইপ চেক করার জন্য == ব্যবহার করুন
  const book = receiptBooks.find((b) => b.boi_number == boiNumber);
  
  if (book && book.available_pages) {
    // নিশ্চিত করুন যে pages অ্যারে হিসেবে আছে
    const pages = Array.isArray(book.available_pages) 
      ? book.available_pages 
      : JSON.parse(book.available_pages || "[]");
    setAvailablePages(pages);
  } else {
    setAvailablePages([]);
    if(boiNumber) toast.error("এই বইয়ের কোনো খালি পৃষ্ঠা পাওয়া যায়নি!");
  }
};
  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>💰 স্টুডেন্ট পেমেন্ট কালেকশন</h2>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
        <input type="number" className="input" placeholder="স্টুডেন্ট আইডি" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <button className="btn btn-approve" onClick={handleSearch}>🔍 অনুসন্ধান</button>
           </div>

      {loading ? ( <p>লোড হচ্ছে...</p> ) : (
        <>
    {studentDetails && (
  <div className="student-details" style={{
    display: "flex",
    flexWrap: "wrap", // মোবাইল ফ্রেন্ডলি করার জন্য wrap ব্যবহার করা ভালো
    justifyContent: "space-between", // আইটেমগুলোর মাঝে সমান দূরত্ব রাখবে
    alignItems: "center",
    padding: "15px",
    background: "#f0f0f0",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #ddd" // হালকা বর্ডার দিলে দেখতে ক্লিন লাগে
  }}>
    <p style={{ margin: 0 }}><strong>নাম:</strong> {studentDetails.name}</p>
    <p style={{ margin: 0 }}><strong>শ্রেণি:</strong> {studentDetails.jamat_name}</p>
    <p style={{ margin: 0 }}><strong>রোল:</strong> {studentDetails.roll}</p>
  </div>
)}
          <table className="due-table">
            <thead>
              <tr>
                <th>✓</th>
                <th>ফি টাইপ / নাম</th>
                <th>মাস</th>
                <th>বকেয়া</th>
                <th>পরিশোধ</th>
                <th>ছাড়</th>
              </tr>
            </thead>
            <tbody>
              {dues.map((d) => {
                const checkedData = checkedFees[d.student_fee_id] || {};
                return (
                  <tr key={d.student_fee_id}>
                    <td><input type="checkbox" checked={!!checkedData.checked} onChange={() => handleCheck(d.student_fee_id, d.due_amount, 0)} /></td>
                    <td>{d.fee_type_name} </td>
                    <td>{d.month_bn || "বাৎসরিক"}</td>
                    <td>{d.due_amount}</td>
                    <td><input type="number" className="input" value={checkedData.amount ?? d.due_amount} onChange={(e) => setCheckedFees(prev => ({...prev, [d.student_fee_id]: {...prev[d.student_fee_id], amount: e.target.value}}))} disabled={!checkedData.checked} /></td>
                    <td><input type="number" className="input" value={checkedData.discount || 0} onChange={(e) => setCheckedFees(prev => ({...prev, [d.student_fee_id]: {...prev[d.student_fee_id], discount: e.target.value}}))} disabled={!checkedData.checked} /></td>
                  </tr>
                );
              })}

              {extraFees.map((ef) => {
                const selectedType = feeTypes.find(t => t.id === parseInt(ef.fee_type_id));
                return (
                  <tr key={ef.tempId} style={{ backgroundColor: "#fff9e6" }}>
                    <td><button onClick={() => removeExtraRow(ef.tempId)}>❌</button></td>
                    <td>
                      <select className="input" value={ef.fee_type_id} onChange={(e) => handleExtraFeeChange(ef.tempId, "fee_type_id", e.target.value)}>
                        <option value="">সিলেক্ট ফি টাইপ</option>
                        {feeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </td>
                    <td>
                      {selectedType?.is_recurring === 1 ? (
                        <select className="input" value={ef.month} onChange={(e) => handleExtraFeeChange(ef.tempId, "month", e.target.value)}>
                          <option value="0">মাস</option>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{banglaMonths[m]}</option>)}
                        </select>
                      ) : <span>বাৎসরিক</span>}
                    </td>
                    <td>{ef.amount} (New)</td>
                    <td><input type="number" className="input" value={ef.paid_amount} onChange={(e) => handleExtraFeeChange(ef.tempId, "paid_amount", e.target.value)} /></td>
                    <td><input type="number" className="input" value={ef.discount_amount} onChange={(e) => handleExtraFeeChange(ef.tempId, "discount_amount", e.target.value)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button className="btn btn-add" onClick={addNewRow} style={{ marginTop: "10px", marginBottom: "20px" }}>➕ তালিকায় নেই এমন ফি যোগ করুন</button>

          <div className="receipt-section" style={{ display: "flex", gap: "10px", padding: "15px", background: "#f4f4f4", borderRadius: "8px" }}>
            <select value={selectedBoi} onChange={(e) => handleBookChange(e.target.value)}>
              <option value="">-- রশিদ বই --</option>
              {receiptBooks.map((b) => (
                <option key={b.boi_number} value={b.boi_number} disabled={b.remaining_pages === 0}>বই {b.boi_number} (বাকি {b.remaining_pages})</option>
              ))}
            </select>
            {availablePages.length > 0 && (
              <select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)}>
                <option value="">-- পৃষ্ঠা নম্বর --</option>
                {availablePages.map((page) => <option key={page} value={page}>পৃষ্ঠা {page}</option>)}
              </select>
            )}
            <button className="btn btn-approve" onClick={handleSubmit}>💸 পেমেন্ট সংগ্রহ করুন</button>
          </div>
        </>
      )}
{/* aadd a full width bar with dropdoww and  and close icon and function*/}

<Section title="স্টুডেন্টের ফি কার্ড" style={{ marginTop: "30px" }}  dropdown={true} defaultOpen={false}>



      <FeeCardTable fees={fees} feetype={feeTypes} coldb={studentPricing} />



</Section>

    </main>
  );
}