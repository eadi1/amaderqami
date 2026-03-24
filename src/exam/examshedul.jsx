import React, { useEffect, useState } from "react";
import {  PDFViewer } from "@react-pdf/renderer";
import MadrasahExamRoutine from "../pdf/MadrasahExamRoutine";
import ApiManager from "../apimanger";
import { useParams } from "react-router-dom";

export default function ExamRoutineWrapper() {
  const { exam_setup_id } = useParams();
  const [examSetup, setExamSetup] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [examSubjects, setExamSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const setup = await ApiManager.get(`/exam-setup/${exam_setup_id}`);
        const cls = await ApiManager.get("/jamat");
        const sub = await ApiManager.get("/kitab");
        const tea = await ApiManager.get("/teacher");
        const examsub = await ApiManager.get(`/exam-subjects/${exam_setup_id}`);

        setExamSetup(setup?.[0] || {}); // safely get first element
        setClasses(cls || []);
        setSubjects(sub || []);
        setTeachers(tea?.data || tea || []);
        setExamSubjects(examsub || []);
        console.console.error(examSetup);
       
      } catch (err) {
        console.error("Error fetching exam routine data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [exam_setup_id]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="main-container">
      {examSetup ? (
        <>
          <PDFViewer
            style={{ width: "100%", height: "600px", border: "1px solid #000" }}
            document={
              <MadrasahExamRoutine
                examsetup={examSetup}
                classes={classes}
                subjects={subjects}
                teachers={teachers}
                examSubjects={examSubjects}
              />
            }
          />

        </>
      ) : (
        <p>No exam setup found.</p>
      )}
    </main>
  );
}