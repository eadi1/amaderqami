import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import Section from "../components/Section";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ExamType() {
  const [examTypes, setExamTypes] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [currentType, setCurrentType] = useState({ id: null, name: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExamTypes();
  }, []);

  // -----------------------------------
  // ✔ FETCH ALL EXAM TYPES
  // -----------------------------------
  const fetchExamTypes = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/examtype");
      setExamTypes(data);
    } catch (err) {
      toast.error("এক্সাম টাইপ লোড করতে সমস্যা!");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // ✔ Add Button
  // -----------------------------------
  const handleAdd = () => {
    setCurrentType({ id: null, name: "" });
    setShowModal(true);
  };

  // -----------------------------------
  // ✔ Edit Button
  // -----------------------------------
  const handleEdit = (item) => {
    setCurrentType(item);
    setShowModal(true);
  };

  // -----------------------------------
  // ✔ Delete
  // -----------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি সত্যিই মুছে ফেলতে চান?")) return;

    try {
      await ApiManager.delete(`/examtype/${id}`);
      setExamTypes(examTypes.filter((x) => x.id !== id));
      toast.success("সফলভাবে মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error("মুছে ফেলার সময় সমস্যা হয়েছে!");
    }
  };

  // -----------------------------------
  // ✔ Save (Add / Edit)
  // -----------------------------------
  const handleSave = async () => {
    if (!currentType.name.trim()) {
      toast.warning("এক্সাম টাইপের নাম দিন!");
      return;
    }

    try {
      if (currentType.id) {
        // UPDATE
        await ApiManager.put(`/examtype/${currentType.id}`, {
          name: currentType.name,
        });

        setExamTypes(
          examTypes.map((x) =>
            x.id === currentType.id ? currentType : x
          )
        );

        toast.success("সফলভাবে আপডেট করা হয়েছে!");
      } else {
        // ADD NEW
        const res = await ApiManager.post("/examtype", {
          name: currentType.name,
        });

        setExamTypes([...examTypes, { id: res.id, name: currentType.name }]);

        toast.success("নতুন এক্সাম টাইপ যুক্ত হয়েছে!");
      }

      setShowModal(false);
    } catch (err) {
      toast.error("সংরক্ষণে সমস্যা হয়েছে!");
      console.log(err);
    }
  };

  // -----------------------------------
  // TABLE COLUMNS
  // -----------------------------------
  const columns = [
    { key: "name", label: "এক্সাম টাইপ" },

  ];

  // -----------------------------------
  // TABLE ROW DATA
  // -----------------------------------
  const tableData = examTypes.map((x) => ({
    id: x.id,
    name: x.name,
    action: (
      <div className="space-x-2">
        <button className="btn btn-edit" onClick={() => handleEdit(x)}>
          ✏️ সম্পাদনা
        </button>
        <button className="btn btn-delete" onClick={() => handleDelete(x.id)}>
          🗑️ মুছুন
        </button>
      </div>
    ),
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <Section title="এক্সাম টাইপ ম্যানেজমেন্ট">
        <button className="btn btn-add mb-3" onClick={handleAdd}>
          + নতুন এক্সাম টাইপ যুক্ত করুন
        </button>

        {loading ? (
          <p>লোড হচ্ছে...</p>
        ) : (
          <Table columns={columns} data={tableData} />
        )}
      </Section>

      {/* MODAL BOX */}
      {showModal && (
        <ModalBox
          title={
            currentType.id ? "এক্সাম টাইপ সম্পাদনা" : "নতুন এক্সাম টাইপ যুক্ত করুন"
          }
          onClose={() => setShowModal(false)}
        >
          <input
            type="text"
            value={currentType.name}
            onChange={(e) =>
              setCurrentType({ ...currentType, name: e.target.value })
            }
            placeholder="এক্সাম টাইপ লিখুন"
            className="w-full mb-3 p-2 border rounded"
          />

          <div className="modal-actions">
            <button className="btn btn-save" onClick={handleSave}>
              💾 সংরক্ষণ
            </button>
            <button className="btn btn-cancel" onClick={() => setShowModal(false)}>
              ❌ বাতিল
            </button>
          </div>
        </ModalBox>
      )}
    </main>
  );
}
