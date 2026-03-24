import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentIdPage() {
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!studentId) {
      setError("অনুগ্রহ করে স্টুডেন্ট আইডি লিখুন");
      return;
    }

    setError("");
    // 👉 redirect with student id
    navigate(`/admission_pdf/${studentId}`);
  };

  return (
    <main className="main-container">
      <div className="form-card" style={{ maxWidth: 400, margin: "auto" }}>
        <h2>স্টুডেন্ট আইডি দিন</h2>

        {error && (
          <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
        )}

        <form onSubmit={handleSubmit}>
            <div className="form-row">
          <div className="field">
            <label>Student ID</label>
            <input
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="স্টুডেন্ট আইডি লিখুন"
            />
          </div>
</div>
          <button className="btn btn-add" type="submit">
            সাবমিট
          </button>
        </form>
      </div>
    </main>
  );
}
