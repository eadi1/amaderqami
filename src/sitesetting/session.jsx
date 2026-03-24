import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import Section from "../components/Section";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Buttons from "../components/buttons";

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSession, setCurrentSession] = useState({ id: null, name: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/session");
      setSessions(data);
    } catch (err) {
      toast.error("Session নিয়ে আসতে সমস্যা!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentSession({ id: null, name: "" });
    setShowModal(true);
  };

  const handleEdit = (session) => {
    setCurrentSession(session);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি সত্যিই এই সেশন মুছে দিতে চান?")) return;
    try {
      await ApiManager.delete(`/session/${id}`);
      setSessions(sessions.filter((s) => s.id !== id));
      toast.success("সেশন সফলভাবে মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error("মুছে ফেলার সময় সমস্যা!");
      console.error(err);
    }
  };

  const handleSetActive = async (id) => {
    if (!window.confirm("আপনি কি সত্যিই এই সেশন অ্যাক্টিভ করতে চান ?")) return;
    try {
      await ApiManager.put(`/session/set/${id}`);
      toast.success("সেশন সক্রিয় করা হয়েছে!");
      fetchSessions();
    } catch (err) {
      toast.error("সেশন সেট করতে সমস্যা!");
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!currentSession.name.trim()) {
      toast.warning("সেশনের নাম দিন!");
      return;
    }

    try {
      if (currentSession.id) {
        await ApiManager.put(`/session/${currentSession.id}`, { name: currentSession.name });
        setSessions(
          sessions.map((s) => (s.id === currentSession.id ? currentSession : s))
        );
        toast.success("সেশন সফলভাবে সম্পাদনা হয়েছে!");
      } else {
        const res = await ApiManager.post("/session", { name: currentSession.name });
        setSessions([...sessions, { id: res.id, name: currentSession.name }]);
        toast.success("নতুন সেশন সফলভাবে যুক্ত হয়েছে!");
      }
      setShowModal(false);
    } catch (err) {
      toast.error("সংরক্ষণে সমস্যা!");
      console.error(err);
    }
  };

  // ✅ Table columns
  const columns = [{key:"name",label:"সেশনের নাম"}];

  // ✅ Table data with custom buttons
  const tableData = sessions.map((s) => ({
    id: s.id,
    name:s.name,
    action: (
      <div className="space-x-2">
        <button className="btn btn-approve" onClick={() => handleSetActive(s.id)}>
          ✅ Set Active
        </button>
        <Buttons type="edit" onClick={() => handleEdit(s)} />
          <Buttons type="delete" onClick={() => handleDelete(s.id)} />
      
       
      </div>
    ),
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <Section title="সেশন ম্যানেজমেন্ট">
        <div className="jamat-actions">
          <button className="btn btn-add" onClick={handleAdd}>
            নতুন সেশন যুক্ত করুন
          </button>
        </div>

        {loading ? (
          <p>লোড হচ্ছে...</p>
        ) : (
          <Table
            columns={columns}
            data={tableData}
            
          />
        )}
      </Section>

      {/* ✅ Reusable ModalBox */}
      {showModal && (
      <ModalBox
  title={currentSession.id ? "সেশন সম্পাদনা করুন" : "নতুন সেশন যুক্ত করুন"}
  onClose={() => setShowModal(false)}
>
  {/* Session Name */}
  <div className="modal-form-row">
    <label>সেশনের নাম</label>
    <input
      type="text"
      value={currentSession.name}
      onChange={(e) =>
        setCurrentSession({ ...currentSession, name: e.target.value })
      }
      placeholder="সেশনের নাম লিখুন"
    />
  </div>

  {/* Action Buttons */}
  <div className="modal-actions">
   
  
    <Buttons type="cancel" onClick={() => setShowModal(false)} />
    <Buttons type="save" onClick={handleSave} />
   
   
  </div>
</ModalBox>

      )}
    </main>
  );
}
