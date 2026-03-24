import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import ModalBox from "../components/modelbox";

// Fund type options
const fundTypeOptions = [
  { value: "sadharon", label: "সাধারণ" },
  { value: "guraba", label: "গুরাবা" },
  { value: "mahfil", label: "মাহফিল" },
  { value: "others", label: "অন্যান্য" },
];

export default function FundManagement() {
  const [funds, setFunds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentFund, setCurrentFund] = useState({
    id: null,
    funder_name: "",
    opening_balance: "",
    current_balance: "",
    type: "",
    other_type: "",
    note: "",
  });

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      const data = await ApiManager.get("/accounting/funds");
      setFunds(data);
    } catch {
      toast.error("ফান্ড লোড করতে সমস্যা হয়েছে");
    }
  };

  const handleAdd = () => {
    setCurrentFund({
      id: null,
      funder_name: "",
      opening_balance: "",
      current_balance: "",
      type: "",
      other_type: "",
      note: "",
    });
    setShowModal(true);
  };

  const handleEdit = (fund) => {
    setCurrentFund({ ...fund });
    setShowModal(true);
  };

// ✅ Delete function with toast confirmation
const handleDelete = (fund) => {
  // Show a toast with confirmation buttons
  const DeleteToast = () => (
    <div>
      <p>আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?</p>
      <div className="flex justify-end gap-2 mt-2">
        <button
          className="btn btn-cancel btn-sm"
          onClick={() => toast.dismiss(toastId)}
        >
          ❌ বাতিল
        </button>
        <button
          className="btn btn-delete btn-sm"
          onClick={async () => {
            toast.dismiss(toastId);
            try {
              await ApiManager.delete(`/accounting/funds/${fund.id}`);
              setFunds(funds.filter((f) => f.id !== fund.id));
              toast.success("ফান্ড মুছে ফেলা হয়েছে");
            } catch (err) {
              const message =
                err.response?.data?.error ||
                "ফান্ড মুছে ফেলতে সমস্যা হয়েছে। নিশ্চিত করুন current balance শূন্য এবং আপনার অনুমতি আছে।";
              toast.error(message);
            }
          }}
        >
          💥 মুছে ফেলুন
        </button>
      </div>
    </div>
  );

  const toastId = toast.info(<DeleteToast />, { autoClose: false });
};


  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentFund.funder_name || !currentFund.type) {
      return toast.error("প্রয়োজনীয় সব তথ্য দিন");
    }

    setSaving(true);

    try {
      const payload = {
        funder_name: currentFund.funder_name,
        opening_balance: parseFloat(currentFund.opening_balance),
        type: currentFund.type,
        other_type: currentFund.type === "others" ? currentFund.other_type : "",
        note: currentFund.note,
      };

      if (currentFund.id) {
        await ApiManager.put(`/accounting/funds/${currentFund.id}`, payload);
        setFunds(funds.map((f) => (f.id === currentFund.id ? { ...f, ...payload } : f)));
        toast.success("ফান্ড আপডেট হয়েছে");
      } else {
        const res = await ApiManager.post("/accounting/funds", payload);
        setFunds([...funds, { ...payload, id: res.id, current_balance: payload.opening_balance }]);
        toast.success("নতুন ফান্ড যোগ হয়েছে");
      }

      setShowModal(false);
    } catch {
      toast.error("সংরক্ষণ করতে সমস্যা হয়েছে");
    }

    setSaving(false);
  };

  // Table columns
  const columns = [
    { key: "funder_name", label: "ফান্ডের নাম" },
    { key: "opening_balance", label: "প্রারম্ভিক ব্যালেন্স" },
    { key: "current_balance", label: "বর্তমান ব্যালেন্স" },
    { key: "type_label", label: "ধরন" },
    { key: "note", label: "নোট" },
  
  ];

  const tableData = funds.map((f) => ({
    ...f,
    type_label:
      f.type === "others"
        ? `অন্যান্য (${f.other_type})`
        : fundTypeOptions.find((t) => t.value === f.type)?.label,
    action: (
      <div className="space-x-2">
        <button className="btn btn-edit" onClick={() => handleEdit(f)}>
          <FaEdit />
        </button>
        <button className="btn btn-delete" onClick={() => handleDelete(f.id)}>
          <FaTrashAlt />
        </button>
      </div>
    ),
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1>ফান্ড ব্যবস্থাপনা</h1>

      <button className="btn btn-add" onClick={handleAdd}>
        ➕ নতুন ফান্ড
      </button>

      <Table columns={columns} data={tableData} />

      {showModal && (
        <ModalBox
          title={currentFund.id ? "ফান্ড সম্পাদনা" : "নতুন ফান্ড"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave}>
            <div className="modal-form-row">
              <label>ফান্ডের নাম</label>
              <input
                type="text"
                value={currentFund.funder_name}
                onChange={(e) =>
                  setCurrentFund({ ...currentFund, funder_name: e.target.value })
                }
              />
            </div>

            <div className="modal-form-row">
              <label>প্রারম্ভিক ব্যালেন্স</label>
              <input
                type="number"
                value={currentFund.opening_balance}
                onChange={(e) =>
                  setCurrentFund({ ...currentFund, opening_balance: e.target.value })
                }
              />
            </div>

            <div className="modal-form-row">
              <label>ফান্ডের ধরন</label>
              <select
                value={currentFund.type}
                onChange={(e) =>
                  setCurrentFund({ ...currentFund, type: e.target.value })
                }
              >
                <option value="">নির্বাচন করুন</option>
                {fundTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {currentFund.type === "others" && (
              <div className="modal-form-row">
                <label>অন্যান্য ধরন লিখুন</label>
                <input
                  type="text"
                  value={currentFund.other_type}
                  onChange={(e) =>
                    setCurrentFund({ ...currentFund, other_type: e.target.value })
                  }
                />
              </div>
            )}

            <div className="modal-form-row">
              <label>নোট</label>
              <textarea
                value={currentFund.note}
                onChange={(e) =>
                  setCurrentFund({ ...currentFund, note: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => {
                  setShowModal(false);
                  setCurrentFund({
                    id: null,
                    funder_name: "",
                    opening_balance: "",
                    current_balance: "",
                    type: "",
                    other_type: "",
                    note: "",
                  });
                }}
              >
                ❌ বাতিল
              </button>
              <button type="submit" className="btn btn-save" disabled={saving}>
                {saving ? (currentFund.id ? "আপডেট হচ্ছে..." : "সংরক্ষণ হচ্ছে...") : "💾 সংরক্ষণ"}
              </button>
            </div>
          </form>
        </ModalBox>
      )}
    </main>
  );
}
