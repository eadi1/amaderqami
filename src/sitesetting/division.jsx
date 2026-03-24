import React, { useEffect, useState } from "react";
import ApiManager from "../apimanger";
import Section from "../components/Section";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Buttons from "../components/buttons";
export default function BivagManagement() {
  const [bivags, setBivags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentBivag, setCurrentBivag] = useState({ id: null, name: "" });
  const [loading, setLoading] = useState(true);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadBivags();
  }, []);

  const loadBivags = async () => {
    setLoading(true);
    try {
      const res = await ApiManager.get("/bivag");
      setBivags(res || []);
    } catch (err) {
      console.error(err);
      toast.error("বিভাগ লোড করতে সমস্যা!");
    } finally {
      setLoading(false);
    }
  };

  /* ================= Add / Edit ================= */
  const handleAdd = () => {
    setCurrentBivag({ id: null, name: "" });
    setShowModal(true);
  };

  const handleEdit = (bivag) => {
    setCurrentBivag(bivag);
    setShowModal(true);
  };

  /* ================= Save ================= */
  const handleSave = async () => {
    if (!currentBivag.name.trim()) {
      toast.warning("বিভাগের নাম দিন!");
      return;
    }

    try {
      if (currentBivag.id) {
        // Update
        const res = await ApiManager.put(`/bivag/${currentBivag.id}`, {
          name: currentBivag.name,
        });
        setBivags((prev) =>
          prev.map((b) => (b.id === res.data.id ? res.data : b))
        );
        toast.success("বিভাগ আপডেট হয়েছে!");
      } else {
        // Add
        const res = await ApiManager.post("/bivag", { name: currentBivag.name });
        setBivags((prev) => [...prev, res.data]);
        toast.success("নতুন বিভাগ যোগ হয়েছে!");
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("সংরক্ষণে সমস্যা!");
    }
  };

  /* ================= Delete ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি সত্যিই এই বিভাগ মুছে দিতে চান?")) return;
    try {
      await ApiManager.delete(`/bivag/${id}`);
      setBivags((prev) => prev.filter((b) => b.id !== id));
      toast.info("বিভাগ মুছে ফেলা হয়েছে");
    } catch (err) {
      console.error(err);
      toast.error("মুছে ফেলতে সমস্যা!");
    }
  };

  /* ================= Table ================= */
  const columns = [{ key: "name", label: "বিভাগের নাম" }];

  const tableData = bivags.map((b) => ({
    id: b.id,
    name: b.name,
    action: (
      <>
    
        <Buttons type='edit' onClick={() => handleEdit(b)} />
       <Buttons type='delete' onClick={() => handleDelete(b.id)} />
          
       
      </>
    ),
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <Section title="বিভাগ ম্যানেজমেন্ট">
      
        <Buttons type="add" onClick={handleAdd} />

        {loading ? <p>লোড হচ্ছে...</p> : <Table columns={columns} data={tableData} />}
      </Section>

      {showModal && (
        <ModalBox
          title={currentBivag.id ? "বিভাগ সম্পাদনা" : "নতুন বিভাগ"}
          onClose={() => setShowModal(false)}
        >
          <div className="modal-form-row">
            <label>বিভাগের নাম</label>
            <input
              type="text"
              value={currentBivag.name}
              onChange={(e) =>
                setCurrentBivag({ ...currentBivag, name: e.target.value })
              }
              placeholder="বিভাগের নাম লিখুন"
            />
          </div>

          <div className="modal-actions">
            <button className="btn btn-cancel" onClick={() => setShowModal(false)}>
              ❌ বাতিল
            </button>
            <button className="btn btn-save" onClick={handleSave}>
              💾 সংরক্ষণ
            </button>
          </div>
        </ModalBox>
      )}
    </main>
  );
}
