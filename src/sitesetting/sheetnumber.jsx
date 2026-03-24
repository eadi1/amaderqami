import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import Section from "../components/Section";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SheetNumberManagement() {
  const [sheets, setSheets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSheet, setCurrentSheet] = useState({
    id: null,
    sheet_number: "",
    date: "",
    notice: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/sheetnumber");
      setSheets(data);
    } catch (err) {
      toast.error("ডাটা লোড করতে সমস্যা!");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentSheet({ id: null, sheet_number: "", date: "", notice: "" });
    setShowModal(true);
  };

  const handleEdit = (sheet) => {
    setCurrentSheet(sheet);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি সত্যিই এই শিট মুছে দিতে চান?")) return;
    try {
      await ApiManager.delete(`/sheetnumber/${id}`);
      setSheets(sheets.filter((s) => s.id !== id));
      toast.success("শিট সফলভাবে মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error("মুছে ফেলার সময় সমস্যা!");
    }
  };

  const handleSave = async () => {
    const { sheet_number, date, notice } = currentSheet;

    if (!sheet_number.trim() || !date.trim() || !notice.trim()) {
      toast.warning("সবগুলো ঘর পূরণ করুন!");
      return;
    }

    try {
      if (currentSheet.id) {
        // Update
        await ApiManager.put(`/sheetnumber/${currentSheet.id}`, {
          sheet_number,
          date,
          notice,
        });

        setSheets(
          sheets.map((s) =>
            s.id === currentSheet.id ? currentSheet : s
          )
        );

        toast.success("শিট সফলভাবে আপডেট হয়েছে!");
      } else {
        // Create
        const res = await ApiManager.post("/sheetnumber", {
          sheet_number,
          date,
          notice,
        });

        setSheets([
          ...sheets,
          { id: res.id, sheet_number, date, notice },
        ]);

        toast.success("নতুন শিট যুক্ত হয়েছে!");
      }

      setShowModal(false);
    } catch (err) {
      toast.error("সংরক্ষণে সমস্যা!");
      console.log(err);
    }
  };

  // Columns
  const columns = [
    { key: "sheet_number", label: "Sheet Number" },
    { key: "date", label: "Date" },
    { key: "notice", label: "Notice" },
  ];
const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

  const tableData = sheets.map((s) => ({
    id: s.id,
    sheet_number: s.sheet_number,
    date: formatDate(s.date),
    notice: s.notice,
    action: (
      <div className="space-x-2">
        <button className="btn btn-edit" onClick={() => handleEdit(s)}>
          ✏️ Edit
        </button>
        <button className="btn btn-delete" onClick={() => handleDelete(s.id)}>
          🗑️ Delete
        </button>
      </div>
    ),
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={2000} />

      <Section title="Sheet Number Management">
        <button className="btn btn-add mb-3" onClick={handleAdd}>
          + Add New Sheet
        </button>

        {loading ? (
          <p>লোড হচ্ছে...</p>
        ) : (
          <Table columns={columns} data={tableData} />
        )}
      </Section>

      {showModal && (
      <ModalBox
  title={currentSheet.id ? "Edit Sheet" : "Add New Sheet"}
  onClose={() => setShowModal(false)}
>
  {/* Sheet Number */}
  <div className="modal-form-row">
    <label>Sheet Number</label>
    <input
      type="text"
      placeholder="Sheet Number"
      value={currentSheet.sheet_number}
      onChange={(e) =>
        setCurrentSheet({ ...currentSheet, sheet_number: e.target.value })
      }
    />
  </div>

  {/* Date */}
  <div className="modal-form-row">
    <label>Date</label>
    <input
      type="date"
      value={currentSheet.date}
      onChange={(e) =>
        setCurrentSheet({ ...currentSheet, date: e.target.value })
      }
    />
  </div>

  {/* Notice */}
  <div className="modal-form-row">
    <label>Notice</label>
    <textarea
      placeholder="Notice"
      value={currentSheet.notice}
      onChange={(e) =>
        setCurrentSheet({ ...currentSheet, notice: e.target.value })
      }
    />
  </div>

  {/* Action Buttons */}
  <div className="modal-actions">
    <button className="btn btn-cancel" onClick={() => setShowModal(false)}>
      ❌ Cancel
    </button>
    <button className="btn btn-save" onClick={handleSave}>
      💾 Save
    </button>
  </div>
</ModalBox>

      )}
    </main>
  );
}
