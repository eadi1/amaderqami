import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table"; // Use the same Table component as ActiveStudents

function InactiveStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jamats, setJamats] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filterJamat, setFilterJamat] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [searchId, setSearchId] = useState("");

  const columns = [
    { key: "id", label: "আইডি" },
    { key: "name", label: "নাম" },
    { key: "jamat", label: "জামাত" },
    { key: "session", label: "সেশন" },
    { key: "phone", label: "ফোন" },
    { key: "dob", label: "জন্ম তারিখ" },

  ];

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 15;

  useEffect(() => {
    fetchFilters();
    fetchInactiveStudents();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [filterJamat, filterSession, searchId, students]);

  const fetchFilters = async () => {
    try {
      const jamatData = await ApiManager.get("/jamat");
      const sessionData = await ApiManager.get("/session");
      setJamats(jamatData);
      setSessions(sessionData);
    } catch (err) {
      toast.error("ফিল্টার ডেটা লোড করতে সমস্যা!");
      console.error(err);
    }
  };

  const fetchInactiveStudents = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/student?status=inactive");
      setStudents(data);
    } catch (err) {
      toast.error("Inactive students নিয়ে আসতে সমস্যা!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let temp = [...students];
    if (filterJamat) temp = temp.filter((s) => s.jamat == filterJamat);
    if (filterSession) temp = temp.filter((s) => s.session == filterSession);
    if (searchId) temp = temp.filter((s) => s.id.toString() === searchId);
    setFilteredStudents(temp);
  };

  const handleReactivate = async (id) => {
    if (!window.confirm("আপনি কি এই শিক্ষার্থীকে সক্রিয় করতে চান?")) return;
    try {
      await ApiManager.put(`/student/${id}/status`, { status: "active" });
      toast.success("Student is now active!");
      fetchInactiveStudents();
    } catch (err) {
      toast.error("Status update failed!");
      console.error(err);
    }
  };

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Map students to tableData with action buttons
  const tableData = currentStudents.map((s) => ({
    id: s.id,
    name: s.name,
    jamat: s.jamat_name,
    session: s.session_name,
    phone: s.phone,
    dob: s.dob,
    action: (
      <button
        onClick={() => handleReactivate(s.id)}
        style={{
          backgroundColor: "green",
          color: "#fff",
          padding: "5px 10px",
          border: "none",
          borderRadius: "5px",
        }}
      >
        ♻️ Reactivate
      </button>
    ),
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="student-management">
        <h1>Inactive Students</h1>

        {/* Filters */}
        <div className="filters" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <select value={filterJamat} onChange={(e) => setFilterJamat(e.target.value)}>
            <option value="">All Jamats</option>
            {jamats.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>

          <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
            <option value="">All Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>

        {loading ? (
          <p>লোড হচ্ছে...</p>
        ) : currentStudents.length === 0 ? (
          <p>No inactive students found.</p>
        ) : (
          <>
            <Table columns={columns} data={tableData} />

            {/* Pagination */}
            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button onClick={prevPage} disabled={currentPage === 1}>
                ⬅️ Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={nextPage} disabled={currentPage === totalPages}>
                Next ➡️
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default InactiveStudents;
