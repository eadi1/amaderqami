import React, { useEffect, useState } from "react";
import ApiManager from "../apimanger";
import { FaPhone, FaCalendar } from "react-icons/fa";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
const BASE_URL = import.meta.env.VITE_API_URL || "";

export default function AttendanceReportPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const role = Cookies.get("role");
  const formatDate = (d) => d.toISOString().slice(0, 10);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const data = await ApiManager.get("/jamat");
        setClasses(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchClasses();
  }, []);

  const fetchAttendance = async (classId, d) => {
    if (!classId) return;
    setLoading(true);
    try {
      const data = await ApiManager.get(
        `/attandance/jamat/${classId}/date/${formatDate(d)}`
      );
      setStudents(
        (data || []).map((s) => ({
          ...s,
          attendance: s.attendance
            ? { ...s.attendance, status: s.attendance.status.toUpperCase() }
            : null,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setStudents([]);
    fetchAttendance(classId, date);
  };

  const handlePreviousDay = () => {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    setDate(prevDate);
    fetchAttendance(selectedClass, prevDate);
  };

  const getCardColor = (status) => {
    switch (status) {
      case "P":
        return "#22c55e";
      case "A":
        return "#ef4444";
      case "L":
        return "#eab308";
      default:
        return "#e5e7eb";
    }
  };

  return (
    <main className="main-container">
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.selectWrapper}>
          <label style={styles.label}>Select Class</label>
          <select value={selectedClass} onChange={handleClassChange} style={styles.select}>
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.dateWrapper}>
          <button style={styles.prevBtn} onClick={handlePreviousDay}>
            Previous
          </button>
          <div style={styles.dateText}>{formatDate(date)}</div>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading && <div style={styles.loading}>Loading...</div>}
      {!loading && students.length === 0 && <div style={styles.loading}>No students found</div>}

      {/* Student Cards */}
      <div style={styles.grid}>
        {students.map((student) => (
          <div
            key={student.id}
            style={{ ...styles.card, backgroundColor: getCardColor(student.attendance?.status) }}
          >
            <div style={styles.studentInfo}>
              {student.photo ? (
                <img
                  src={`${BASE_URL}/${student.photo.replaceAll("\\", "/")}`}
                  alt={student.name}
                  style={styles.photo}
                />
              ) : (
                <div style={styles.noPhoto}>{student.name[0]}</div>
              )}
              <div>
                <div style={styles.studentName}>{student.name}</div>
                <div style={styles.rollText}>Roll: {student.roll}</div>
              </div>
            </div>

            <div style={styles.actions}>
              <Link
                to={`/dashboard/attendancereport/${student.id}`}
                style={{ ...styles.actionBtn, backgroundColor: "#3b82f6" }}
              >
                <FaCalendar style={styles.icon} />
              </Link>
            {role == "administrator"  && (
  <a
    href={`tel:${student.phone}`}
    style={{ ...styles.actionBtn, backgroundColor: "#22c55e" }}
  >
    <FaPhone style={{ ...styles.icon, transform: "rotate(180deg)" }} />
  </a>
)}

            </div>
          </div>
        ))}
      </div>
    </div>
    </main>
  );
}

// Custom CSS Styles
const styles = {
  container: {
    maxWidth: "900px",
    margin: "20px auto",
    padding: "15px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "15px",
  },
  selectWrapper: {
    flex: 1,
    minWidth: "200px",
    marginBottom: "10px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: 500,
    color: "#111827",
  },
  select: {
    width: "100%",
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },
  dateWrapper: {
    textAlign: "right",
  },
  prevBtn: {
    padding: "8px 15px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#fff",
    cursor: "pointer",
  },
  dateText: {
    marginTop: "4px",
    fontSize: "14px",
    color: "#374151",
  },
  loading: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "16px",
    color: "#374151",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "15px",
  },
  card: {
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s",
  },
  studentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  photo: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #fff",
  },
  noPhoto: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#d1d5db",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#374151",
    fontWeight: 600,
    fontSize: "18px",
  },
  studentName: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#111827",
  },
  rollText: {
    fontSize: "13px",
    color: "#374151",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  actionBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    textDecoration: "none",
  },
  icon: {
    fontSize: "18px",
  },
};
