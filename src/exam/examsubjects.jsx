import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import Section from "../components/Section";
import Table from "../components/Table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Buttons from "../components/buttons";
import { Link, useParams } from "react-router-dom";

export default function ExamSubjects() {
  const { exam_setup_id } = useParams();

  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [examSubjects, setExamSubjects] = useState([]);

  const [newData, setNewData] = useState({
    class_id: "",
    subject_id: "",
    teacher_id: "",
    exam_date: "",
    total_mark: 100,
    pass_mark: 33,
    exam_setup_id: exam_setup_id
  });

  const [loading, setLoading] = useState(false);

  // ------------------- Fetch Data -------------------
  useEffect(() => {
    fetchData();
  }, [exam_setup_id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sub = await ApiManager.get("/kitab");
      const cls = await ApiManager.get("/jamat");
      const tea = await ApiManager.get("/teacher");
      const examsub = await ApiManager.get(
        `/exam-subjects/${exam_setup_id}`
      );

      setSubjects(sub);
      setClasses(cls);
      setTeachers(tea.data);
      setExamSubjects(examsub);
    } catch {
      toast.error("ডাটা লোড করতে সমস্যা!");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Class → Filter Subjects -------------------
  const handleClassChange = (classId) => {
    setNewData({ ...newData, class_id: classId, subject_id: "", teacher_id: "" });
    setFilteredSubjects(subjects.filter((s) => String(s.jamat) === String(classId)));
  };

  // ------------------- Subject → Filter Teachers -------------------
  const handleSubjectChange = (subjectId) => {
    setNewData({ ...newData, subject_id: subjectId });
  };

  // ------------------- Add Exam Subject -------------------
  const handleAdd = async () => {
    if (!newData.class_id || !newData.subject_id || !newData.teacher_id) {
      toast.warning("সব তথ্য নির্বাচন করুন!");
      return;
    }
    try {
      const res = await ApiManager.post("/exam-subjects", newData);
      setExamSubjects([...examSubjects, { id: res.id, ...newData }]);
      setNewData({
        class_id: "",
        subject_id: "",
        teacher_id: "",
        exam_date: "",
        total_mark: 100,
        pass_mark: 33,
        exam_setup_id: exam_setup_id
      });
      setFilteredSubjects([]);
      toast.success("সফলভাবে যুক্ত হয়েছে!");
    } catch {
      toast.error("সংরক্ষণে সমস্যা হয়েছে!");
    }
  };

  // ------------------- Delete Exam Subject -------------------
  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি মুছে ফেলতে চান?")) return;
    try {
      await ApiManager.delete(`/exam-subjects/${id}`);
      setExamSubjects(examSubjects.filter((x) => x.id !== id));
      toast.success("মুছে ফেলা হয়েছে!");
    } catch {
      toast.error("Delete করতে সমস্যা হয়েছে!");
    }
  };

  // ------------------- Prepare Table Data -------------------
  const getTableData = (classId) => {
    return examSubjects
      .filter((x) => String(x.class_id) === String(classId))
      .map((x) => ({
        id: x.id,
        class: classes.find((c) => String(c.id) === String(x.class_id))?.name || "N/A",
        subject: subjects.find((s) => String(s.id) === String(x.subject_id))?.name || "N/A",
        teacher: teachers.find((t) => String(t.id) === String(x.teacher_id))?.name || "N/A",
        date: x.exam_date
          ? new Date(x.exam_date).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })
          : "-",
        action: (
          <div className="action-buttons">
         
            <Buttons type="delete" onClick={() => handleDelete(x.id)} />
          </div>
        )
      }));
  };

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <Section title="Exam Subjects">

        {/* ----------------- INLINE CSS ----------------- */}
        <style>{`
          .exam-form {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
          }
          .exam-form select,
          .exam-form input {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            min-width: 120px;
          }
          .exam-form input[type="number"] {
            max-width: 100px;
          }
          .exam-form button.btn-add {
            padding: 8px 16px;
            background-color: #28a745;
            border: none;
            color: #fff;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            transition: 0.3s;
          }
          .exam-form button.btn-add:hover {
            background-color: #218838;
          }
          .action-buttons {
            display: flex;
            gap: 5px;
          }
          .class-section {
            margin-bottom: 30px;
          }
          .class-section h3 {
            margin-bottom: 10px;
          }
          @media screen and (max-width: 768px) {
            .exam-form select,
            .exam-form input,
            .exam-form button.btn-add {
              flex: 1 1 100%;
              min-width: unset;
            }
          }
        `}</style>

        {/* ----------------- ADD FORM ----------------- */}
        <div className="exam-form">
          <select value={newData.class_id} onChange={(e) => handleClassChange(e.target.value)}>
            <option value="">Class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={newData.subject_id} onChange={(e) => handleSubjectChange(e.target.value)}>
            <option value="">Subject</option>
            {filteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select value={newData.teacher_id} onChange={(e) => setNewData({ ...newData, teacher_id: e.target.value })}>
            <option value="">Teacher</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <input type="date" value={newData.exam_date} onChange={(e) => setNewData({ ...newData, exam_date: e.target.value })} />
          <input type="number" placeholder="Total Mark" value={newData.total_mark} onChange={(e) => setNewData({ ...newData, total_mark: e.target.value })} />
          <input type="number" placeholder="Pass Mark" value={newData.pass_mark} onChange={(e) => setNewData({ ...newData, pass_mark: e.target.value })} />
          <button className="btn-add" onClick={handleAdd}>Add</button>
        </div>

        {loading && <p>Loading...</p>}

        {/* ----------------- Tables by Class ----------------- */}
        {classes.map((cls) => {
          const data = getTableData(cls.id);
          if (!data.length) return null;
          return (
            <div key={cls.id} className="class-section">
              <h3>{cls.name}</h3>
              <Table columns={[
                { key: "subject", label: "বিষয়" },
                { key: "teacher", label: "শিক্ষক" },
                { key: "date", label: "তারিখ" },
              ]} data={data} />
            </div>
          );
        })}

      </Section>
    </main>
  );
}