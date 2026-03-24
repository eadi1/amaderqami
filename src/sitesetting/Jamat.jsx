import React, { useEffect, useState } from "react";
import ApiManager from "../apimanger";
import Section from "../components/Section";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import Buttons from "../components/buttons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function JamatManagement() {
  const [jamats, setJamats] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [currentJamat, setCurrentJamat] = useState({
    id: null,
    name: "",
    division: "",
  });

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await ApiManager.get("/jamat");
      setJamats(res || []);
      const divs = await ApiManager.get("/bivag");
      setDivisions(divs);
    } catch (err) {
      console.error("Fetch jamats failed:", err);
      toast.error("জামাত লোড করতে সমস্যা হয়েছে");
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!currentJamat.name || !currentJamat.division) {
      toast.warning("সব তথ্য দিন");
      return;
    }

    try {
      if (currentJamat.id) {
        // UPDATE
        await ApiManager.put(`/jamat/${currentJamat.id}`, currentJamat);
        toast.success("জামাত আপডেট হয়েছে");
      } else {
        // ADD
        const res = await ApiManager.post("/jamat", currentJamat);
        toast.success("নতুন জামাত সংরক্ষিত হয়েছে");
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("সংরক্ষণ ব্যর্থ হয়েছে");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    try {
      await ApiManager.delete(`/jamat/${id}`);
      toast.info("জামাত মুছে ফেলা হয়েছে");
      loadData();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { key: "name", label: "জামাত" },
    { key: "division", label: "বিভাগ" },
    { key: "status", label: "স্ট্যাটাস" },
  ];

  const tableData = jamats.map((j) => ({
    id: j.id,
    name: j.name,
    division:
      divisions.find((d) => String(d.id) === String(j.division))?.name || "N/A",
    status: "Online ✅",
    action: (
      <>
        <Buttons
          type="edit"
          onClick={() => {
            setCurrentJamat(j);
            setShowModal(true);
          }}
        />
        <Buttons type="delete" onClick={() => handleDelete(j.id)} />
      </>
    ),
  }));

  /* ================= UI ================= */
  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <Section title="জামাত ম্যানেজমেন্ট">
        <Buttons
          type="add"
          onClick={() => {
            setCurrentJamat({ id: null, name: "", division: "" });
            setShowModal(true);
          }}
        />
        <Buttons type="check" onClick={loadData} />
        <Table columns={columns} data={tableData} />
      </Section>

      {showModal && (
        <ModalBox
          title={currentJamat.id ? "জামাত সম্পাদনা" : "নতুন জামাত"}
          onClose={() => setShowModal(false)}
        >
          <div className="modal-form-row">
            <label>জামাতের নাম</label>
            <input
              type="text"
              value={currentJamat.name}
              onChange={(e) =>
                setCurrentJamat({ ...currentJamat, name: e.target.value })
              }
            />
          </div>

          <div className="modal-form-row">
            <label>বিভাগ</label>
            <select
              value={currentJamat.division}
              onChange={(e) =>
                setCurrentJamat({
                  ...currentJamat,
                  division: e.target.value,
                })
              }
            >
              <option value="">-- নির্বাচন করুন --</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <Buttons type="cancel" onClick={() => setShowModal(false)} />
            <Buttons type="save" onClick={handleSave} />
          </div>
        </ModalBox>
      )}
    </main>
  );
}
