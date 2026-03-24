import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModalBox from "../components/modelbox";
import Section from "../components/Section";
import Table from "../components/Table";
import CrudModal from "../components/add";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
// Options for db_col with Bangla labels
const dbColOptions = [
  { value: "monthlyBeton", label: "মাসিক বেতন" },
  { value: "monthlyGarivara", label: "মাসিক গাড়ী ভাড়া" },
  { value: "khoraki", label: "মাসিক খাদ্য" },

];

export default function FeeTypeManagement() {
  const [feeTypes, setFeeTypes] = useState([]);
   const [funds, setFunds] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentFeeType, setCurrentFeeType] = useState({
    id: null,
    name: "",
    amount: "",
    is_recurring: false,
    preallocated: false, // Corrected typo
    db_col: "",    
    fund:null  });

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  const fetchFeeTypes = async () => {
    try {
      const data = await ApiManager.get("/accounting/fee-types");
       const data1 = await ApiManager.get("/accounting/funds");
       setFunds(data1);
      setFeeTypes(data);
    } catch (err) {
      toast.error("Fee Type লোড করতে সমস্যা হয়েছে");
    }
  };

  const handleAdd = () => {
    setCurrentFeeType({
      id: null,
      name: "",
      amount: "",
      is_recurring: false,
      preallocated: false,
      db_col: "",
      fund:null
    });
    setShowModal(true);
  };

  const handleEdit = (feeType) => {
    setCurrentFeeType({
      id: feeType.id,
      name: feeType.name,
      amount: feeType.amount,
      is_recurring: !!feeType.is_recurring,
      preallocated: !!feeType.preallocated,
      db_col: feeType.db_col || "",
      fund:feeType.fund,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি মুছে ফেলতে চান?")) return;
    try {
      await ApiManager.delete(`/accounting/fee-types/${id}`);
      setFeeTypes(feeTypes.filter((f) => f.id !== id));
      toast.success("Fee Type মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error("মুছে ফেলতে সমস্যা হয়েছে");
    }
  };

  const handleSave = async () => {
    if (!currentFeeType.name.trim() || !currentFeeType.amount) {
      return toast.error("ফি টাইপ নাম এবং টাকার পরিমাণ দিন");
    }

    setSaving(true);

    try {
      const payload = {
        name: currentFeeType.name,
        amount: parseFloat(currentFeeType.amount),
        is_recurring: currentFeeType.is_recurring ? 1 : 0,
        preallocated: currentFeeType.preallocated ? 1 : 0,
        db_col: currentFeeType.preallocated ? currentFeeType.db_col : "",
        fund:currentFeeType.fund,
      };

      let res;
      if (currentFeeType.id) {
        res = await ApiManager.put(`/accounting/fee-types/${currentFeeType.id}`, payload);
        setFeeTypes(
          feeTypes.map((f) => (f.id === currentFeeType.id ? { ...f, ...payload } : f))
        );
        toast.success("Fee Type আপডেট হয়েছে!");
      } else {
        res = await ApiManager.post("/accounting/fee-types", payload);
        setFeeTypes([...feeTypes, { ...payload, id: res.id }]);
        toast.success("নতুন Fee Type যোগ হয়েছে!");
      }

      setShowModal(false);
    } catch (err) {
      toast.error("সংরক্ষণ করতে সমস্যা হয়েছে");
    }

    setSaving(false);
  };

  const handleChange = (name, value) => {
    setCurrentFeeType((prev) => ({ ...prev, [name]: value }));
  };


// Columns
const columns = [
  { key: "name", label: "ফি টাইপ" },
  { key: "amount", label: "টাকার পরিমাণ" },
  { key: "is_recurring", label: "মাসিক/বাৎসরিক" },
  { key: "preallocated", label: "ভর্তির সময় নির্ধারিত" },
   { key: "fund", label: "ফান্ড" },


];

// Table data with action buttons
const tableData = feeTypes.map((f) => ({
  id: f.id,
  name: f.name,
  amount: f.amount,
  is_recurring: f.is_recurring ? "মাসিক" : "বাৎসরিক",
  preallocated: f.preallocated ? dbColOptions.find((o) => o.value === f.db_col)?.label || "-" : "-",
  fund:funds.find(fund => fund.id === f.fund)?.funder_name || "",
  action: (
    <div className="space-x-2">
      <button
        className={`btn ${f.is_recurring ? "btn-edit-recurring" : "btn-edit"}`}
        onClick={() => handleEdit(f)}
      >
         <FaEdit />
      </button>
      <button
        className={`btn ${f.amount > 1000 ? "btn-delete-warning" : "btn-delete"}`}
        onClick={() => handleDelete(f.id)}
      >
          <FaTrashAlt />
      </button>
    </div>
  ),
}));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1>ফী এর ধরন নিয়ন্ত্রণ</h1>
      <button className="btn btn-add" onClick={handleAdd}>
        ➕ নতুন Fee Type
      </button>

<Table columns={columns} data={tableData}></Table>

    

  {showModal &&(  <ModalBox
  title={saving ? "Saving..." : currentFeeType.id ? "Fee Type সম্পাদনা" : "নতুন Fee Type"}
  onClose={() => setShowModal(false)}
>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSave();
    }}
  >
    {/* Fund Select */}
    <div className="modal-form-row">
      <label>ফান্ড নির্বাচন করুন</label>
      <select
        value={currentFeeType.fund || ""}
        onChange={(e) =>
          setCurrentFeeType({ ...currentFeeType, fund: e.target.value })
        }
      >
        <option value="">-- ফান্ড নির্বাচন করুন --</option>
        {funds.map((f) => (
          <option key={f.id} value={f.id}>
            {f.funder_name}
          </option>
        ))}
      </select>
    </div>

    {/* Fee Type Name */}
    <div className="modal-form-row">
      <label>ফি টাইপ</label>
      <input
        type="text"
        value={currentFeeType.name}
        onChange={(e) =>
          setCurrentFeeType({ ...currentFeeType, name: e.target.value })
        }
        placeholder="ফি টাইপ লিখুন"
      />
    </div>

    {/* Amount */}
    <div className="modal-form-row">
      <label>টাকার পরিমাণ</label>
      <input
        type="number"
        value={currentFeeType.amount}
        onChange={(e) =>
          setCurrentFeeType({ ...currentFeeType, amount: e.target.value })
        }
        placeholder="টাকার পরিমাণ দিন"
      />
    </div>

    {/* Recurring */}
    <div className="modal-form-row">
      <label>মাসিক ফী হলে টিক দিন</label>
      <input
        type="checkbox"
        checked={currentFeeType.is_recurring}
        onChange={(e) =>
          setCurrentFeeType({ ...currentFeeType, is_recurring: e.target.checked })
        }
      />
    </div>

    {/* Preallocated */}
    <div className="modal-form-row">
      <label>ভর্তির সময় নির্ধারিত হলে</label>
      <input
        type="checkbox"
        checked={currentFeeType.preallocated}
        onChange={(e) =>
          setCurrentFeeType({ ...currentFeeType, preallocated: e.target.checked })
        }
      />
    </div>

    {/* DB Column (select only if preallocated) */}
    {currentFeeType.preallocated && (
      <div className="modal-form-row">
        <label>যাহা বলিয়া নির্ধারণ করা</label>
        <select
          value={currentFeeType.db_col || ""}
          onChange={(e) =>
            setCurrentFeeType({ ...currentFeeType, db_col: e.target.value })
          }
        >
          <option value="">নির্বাচন করুন</option>
          {dbColOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* Actions */}
    <div className="modal-actions">
      <button
        type="button"
        className="btn btn-cancel"
        onClick={() => setShowModal(false)}
      >
        ❌ বাতিল
      </button>
      <button type="submit" className="btn btn-save" disabled={saving}>
        {saving ? (currentFeeType.id ? "আপডেট হচ্ছে..." : "সংরক্ষণ হচ্ছে...") : "💾 সংরক্ষণ"}
      </button>
    </div>
  </form>
</ModalBox>
  )}
    </main>
  );
}
