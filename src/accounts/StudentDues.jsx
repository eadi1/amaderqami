import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MonthSelectModal from "../components/MonthSelectModal";
import Table from "../components/Table";
import { Link } from "react-router-dom";
import Button from "../components/buttons";
import ModalBox from "../components/modelbox";

export default function StudentDues() {
  const [feeTypes, setFeeTypes] = useState([]);
  const [jamatList, setJamatList] = useState([]);
  const [dues, setDues] = useState([]);

  const [selectedJamat, setSelectedJamat] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");

  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedFeeType, setSelectedFeeType] = useState(null);
  const [selectedDue, setSelectedDue] = useState(null);

  const [currentFund, setCurrentFund] = useState({ amount: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreallocatedFeeTypes();
    fetchJamatList();
  }, []);

  /* -------------------- LOAD DATA -------------------- */

  const fetchPreallocatedFeeTypes = async () => {
    try {
      setLoading(true);
      const data = await ApiManager.get("/accounting/fee-types");
      setFeeTypes(data.filter(f => f.preallocated));
    } catch {
      toast.error("ফি টাইপ লোড করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  const fetchJamatList = async () => {
    try {
      const res = await ApiManager.get("/jamat");
      setJamatList(res || []);
    } catch {
      toast.error("জামাত লোড করতে সমস্যা হয়েছে!");
    }
  };

  const fetchStudentDues = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (studentId) query.append("student_id", studentId);
      if (studentName) query.append("name", studentName);
      if (selectedJamat) query.append("jamat", selectedJamat);

      const res = await ApiManager.get(
        `/accounting/student-fees/due/?${query.toString()}`
      );
      setDues(res.data || []);
    } catch {
      toast.error("বকেয়া লোড করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- ADD DUE -------------------- */

  const handlePayClick = (feeType) => {
    setSelectedFeeType(feeType);
    setShowAddModal(true);
  };

  const handleMonthSubmit = async (month) => {
    try {
      await ApiManager.post("/accounting/student-fees", {
        fee_type_id: selectedFeeType.id,
        month,
      });
      toast.success("বকেয়া যোগ হয়েছে!");
      setShowAddModal(false);
      fetchStudentDues();
    } catch {
      toast.error("বকেয়া যোগ ব্যর্থ!");
    }
  };

  /* -------------------- EDIT DUE -------------------- */

  const handleEditClick = (due) => {
    setSelectedDue(due);
  
    setCurrentFund({ amount: due.due_amount,id:due.student_fee_id });
    setShowEditModal(true);
  };

  const handleDueUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await ApiManager.put(
        `/accounting/student-fees/${currentFund.id}`,
        { due_amount: currentFund.amount }
      );
      toast.success("বকেয়া আপডেট সফল!");
      setShowEditModal(false);
      fetchStudentDues();
    } catch {
      toast.error("আপডেট ব্যর্থ!");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- TABLE -------------------- */

  const columns = [
    { key: "student_id", label: "আইডি" },
    { key: "name", label: "নাম" },
    { key: "jamat_name", label: "জামাত" },
    { key: "fee_type_name", label: "ফি টাইপ" },
    { key: "month_bn", label: "মাস" },
    { key: "due_amount", label: "বকেয়া" },
  ];

  const tableData = dues
    .filter(d => parseFloat(d.due_amount) > 0)
    .map(d => ({
      ...d,
      month_bn: d.month_bn || "বাৎসরিক",
      action: (
        <Button type="edit" onClick={() => handleEditClick(d)} />
      ),
    }));

  /* -------------------- UI -------------------- */

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2>ভর্তির সময় নির্ধারিত ফি টাইপ</h2>

      {feeTypes.map(f => (
        <button
          key={f.id}
          className="btn btn-approve"
          onClick={() => handlePayClick(f)}
        >
          {f.name} — বকেয়া যুক্ত করুন
        </button>
      ))}

      <div className="filter-section">
        <select value={selectedJamat} onChange={e => setSelectedJamat(e.target.value)}>
          <option value="">-- জামাত নির্বাচন করুন --</option>
          {jamatList.map(j => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>

        <input
          placeholder="শিক্ষার্থীর আইডি"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
        />

        <input
          placeholder="শিক্ষার্থীর নাম"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
        />

        <button className="btn btn-view" onClick={fetchStudentDues}>
          অনুসন্ধান
        </button>

        <Link to="manual-due-entry" className="btn btn-back">
          ম্যানুয়াল বকেয়া
        </Link>
      </div>

      {tableData.length > 0 && (
        <Table columns={columns} data={tableData} />
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <MonthSelectModal
          feeType={selectedFeeType}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleMonthSubmit}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <ModalBox onClose={() => setShowEditModal(false)} title="বকেয়া সম্পাদনা করুন">
          <form onSubmit={(e) => handleDueUpdate(e)}>
          
 <div className="modal-form-row">
        <label>বকেয়া পরিমাণ</label>
            <input
              type="number"
              value={currentFund.amount}
              onChange={e => setCurrentFund({ amount: e.target.value, id: currentFund.id })}
              required
            />
          </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-delete" onClick={() => setShowEditModal(false)}>
                বাতিল
              </button>
              <button type="submit" className="btn btn-add" disabled={saving}>
                {saving ? "আপডেট হচ্ছে..." : "সংরক্ষণ"}
              </button>
            </div>
          </form>
        </ModalBox>
      )}
    </main>
  );
}
