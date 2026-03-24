import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import Section from "../components/Section";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Buttons from "../components/buttons";
import { Link } from "react-router-dom";
export default function ExamSetup() {
  const [examTypes, setExamTypes] = useState([]);
  const [session, setSession]= useState([]);
  const [examsetup, setExamsetup]= useState([]);

  const [showModal, setShowModal] = useState(false);
  const [currentType, setCurrentType] = useState({ id: null, exam_type_id: null, session_id:null });
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
      const data1 = await ApiManager.get("/exam-setup");
      const data2 = await ApiManager.get("/session");
      setExamTypes(data);
      setExamsetup(data1);
      setSession(data2);
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
    setCurrentType({ id: null, exam_type_id:null,session_id:null });
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
      await ApiManager.delete(`/exam-setup/${id}`);
      setExamsetup(examsetup.filter((x) => x.id !== id));
      toast.success("সফলভাবে মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error("মুছে ফেলার সময় সমস্যা হয়েছে!");
    }
  };

  // -----------------------------------
  // ✔ Save (Add / Edit)
  // -----------------------------------
  const handleSave = async () => {
    if (!currentType.exam_type_id.trim()) {
      toast.warning("এক্সাম টাইপ নির্বাচন করুন!");
      return;
    } 
    if (!currentType.session_id.trim()) {
      toast.warning("শিক্ষাবর্ষ নির্বাচন করুন!");
      return;
    } 

    try {
      if (currentType.id) {
        // UPDATE
        await ApiManager.put(`/exam-setup/${currentType.id}`, {
          exam_type_id: currentType.exam_type_id,
          session_id:currentType.session_id
        });

        setExamTypes(
          examsetup.map((x) =>
            x.id === currentType.id ? currentType : x
          )
        );

        toast.success("সফলভাবে আপডেট করা হয়েছে!");
      } else {
        // ADD NEW
        const res = await ApiManager.post("/exam-setup", {
          exam_type_id: currentType.exam_type_id,
          session_id:currentType.session_id
        });

        setExamsetup([...examsetup, { id: res.id, exam_type_id: currentType.exam_type_id,session_id:currentType.session_id }]);

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
    { key: "exam_type_id", label: "পরীক্ষার ধরন" },
     { key: "session_id", label: "শিক্ষাবর্ষ " },


  ];

  // -----------------------------------
  // TABLE ROW DATA
  // -----------------------------------
  const tableData = examsetup.map((x) => ({
    id: x.id,
    exam_type_id: examTypes.find((j) => String(j.id) === String(x.exam_type_id))?.name || "N/A",
    session_id:session.find((j) => String(j.id) === String(x.session_id))?.name || "N/A",
    action: (
      <div className="space-x-2">
        <Link to={`/exam-management/exam-setup/exam-subjects/${x.id}`} >
        <Buttons type="view"  />
        </Link>
       <Link to={`/exam-management/exam-subjects/${x.id}/pdf`}>
  <Buttons type="download" />
</Link>
        
        <Buttons type="edit" onClick={() => handleEdit(x)} />
      <Buttons type="delete" onClick={() => handleDelete(x.id)} />
        
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
           <div className="modal-form-row">
    <label>পরীক্ষার ধরন নির্বাচন</label>
    <select
      value={currentType.exam_type_id}
      onChange={(e) =>
        setCurrentType({ ...currentType, exam_type_id: e.target.value })
      }
    >
      <option value="">-- পরিক্ষার ধরন নির্বাচন করুন --</option>
      {examTypes.map((j) => (
        <option key={j.id} value={j.id}>
          {j.name}
        </option>
      ))}
    </select>
  </div>
 <div className="modal-form-row">
    <label>শিক্ষাবর্ষ নির্বাচন</label>
    <select
      value={currentType.session_id}
      onChange={(e) =>
        setCurrentType({ ...currentType, session_id: e.target.value })
      }
    >
      <option value="">-- শিক্ষাবর্ষ নির্বাচন করুন --</option>
      {session.map((j) => (
        <option key={j.id} value={j.id}>
          {j.name}
        </option>
      ))}
    </select>
  </div>

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
