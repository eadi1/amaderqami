import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import Section from "../components/Section";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
 
  /* ---------------------- Load All Teachers ---------------------- */
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/teacher");
      setTeachers(data.data);
    } catch (err) {
      toast.error("শিক্ষক লোড করতে সমস্যা!");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("মুছে ফেলতে চান?")) return;
    try {
      await ApiManager.delete(`/teacher/${id}`);
      setTeachers(teachers.filter((t) => t.id !== id));
      toast.success("মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error("মুছতে সমস্যা!");
    }
  };

 

  /* ------------------------ Step Forms ------------------------ */


  

  /* ------------------------ useMemo to prevent re-render ------------------------ */

  /* ------------------------ UI ------------------------ */
  return (
    <main className="main-container">
      <Section title="শিক্ষক ব্যবস্থাপনা">
        <Link to="add" className="btn btn-add mb-3">নতুন শিক্ষক যোগ</Link>
        
        <Table
          columns={[
          
            { label: "বাংলা নাম", key: "bangla_name" },
            { label: "ফোন", key: "phone" },
            { label: "পদবী", key: "designation" },
            { label: "ডিপার্টমেন্ট", key: "department" },
          ]}
          data={teachers.map((t) => ({
            ...t,
            action: (
              <>
                 <Link to={`view/${t.id}`} className="btn btn-view btn-sm me-2">বিস্তারিত</Link>
               <Link to={`edit/${t.id}`} className="btn btn-edit btn-sm me-2">সম্পাদনা</Link>
               
                <button className="btn btn-delete btn-sm" onClick={() => handleDelete(t.id)}>ডিলিট</button>
              </>
            ),
          }))}
          loading={loading}
        />

    

        <ToastContainer />
      </Section>
    </main>
  );
}
  