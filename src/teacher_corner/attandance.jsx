import React, { useEffect, useState, useCallback } from "react";
import ApiManager from "../apimanger";
import { toast } from "react-toastify";

// Memoized Student Row
const StudentRow = React.memo(({ student, onMark }) => {
  const status = student.attendance?.status?.toUpperCase();
const getDayNumber = (date) => {
  const d = new Date(date);
  return d.getDate(); // শুধু দিন
};

  const getButtonStyle = (s) => {
    if (status === s) {
      return {
        backgroundColor:
          s === "P" ? "#22c55e" : s === "A" ? "#ef4444" : "#eab308",
        color: "#fff",
      };
    }
    return {
      backgroundColor: "#d1d5db",
      color: "#374151",
    };
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        marginBottom: "10px",
        border: student.attendance?.id ? "2px solid #93c5fd" : "none",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div>
          <div style={{ fontWeight: 500, color: "#111827" }}>{student.name}</div>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            Roll: {student.roll}
          </div>
        </div>
      </div>

     <div style={{ fontSize: "13px", color: "#6b7280" }}>
  {student.previous.length === 0 ? (
    "কোন তথ্য নেই"
  ) : (
    student.previous.map((p) => (
      <span
        key={p.date}
        style={{
          marginRight: "8px",
          padding: "4px 8px",
          borderRadius: "8px",
          background:
            p.status === "P"
              ? "#dcfce7"
              : p.status === "A"
              ? "#fee2e2"
              : "#fef9c3",
          color:
            p.status === "P"
              ? "#166534"
              : p.status === "A"
              ? "#991b1b"
              : "#854d0e",
          fontWeight: 500,
        }}
      >
        {getDayNumber(p.date)} {p.status}
      </span>
    ))
  )}
</div>



      <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
        {["P", "A", "L"].map((s) => (
          <button
            key={s}
            onClick={() => onMark(student.id, s)}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              ...getButtonStyle(s),
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
});
StudentRow.displayName = "StudentRow";

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jamats, setJamats] = useState([]);

  const today = new Date().toISOString().slice(0, 10);

  // Fetch Jamats only once
  useEffect(() => {
    const fetchJamats = async () => {
      try {
        const jamatData = await ApiManager.get("/jamat");
        setJamats(jamatData || []);
      } catch (e) {
        toast.error("Jamat data fetch failed");
        console.error(e);
      }
    };
    fetchJamats();
  }, []);

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setStudents([]);
    if (!classId) return;

    setLoading(true);
    try {
      const data = await ApiManager.get(
        `/attandance/jamat/${classId}/date/${today}`
      );

      const formatted = (data || []).map((s) => ({
        ...s,
        attendance: s.attendance
          ? { ...s.attendance, status: s.attendance.status.toUpperCase() }
          : null,
      }));
      setStudents(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleMark = useCallback(
    async (studentId, status) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, attendance: { ...s.attendance, status } }
            : s
        )
      );

      const student = students.find((s) => s.id === studentId);
      if (!student) return;

      try {
        if (student.attendance?.id) {
          await ApiManager.put(`/attandance/${student.attendance.id}`, {
            status,
          });
          return;
        }

        const payload = {
          student_id: studentId,
          attendance_date: today,
          attendance_time: new Date().toLocaleTimeString(),
          status,
        };

        const res = await ApiManager.post("/attandance", payload);
        if (res.success) {
          setStudents((prev) =>
            prev.map((s) =>
              s.id === studentId
                ? { ...s, attendance: { status, id: res.id } }
                : s
            )
          );
        }
      } catch (err) {
        console.error("Failed to update attendance:", err);
        toast.error("Failed to mark attendance");
      }
    },
    [students, today]
  );

  return (
    <main className="main-container">
    <div style={styles.container}>
      <h2 style={styles.title}>শিক্ষার্থীর হাজিরা</h2>

      <div style={styles.selector}>
        <label style={styles.label}>জামাত নির্বাচন করুন</label>
        <select
          value={selectedClass}
          onChange={handleClassChange}
          style={styles.select}
        >
          <option value="">-- Select Jamat --</option>
          {jamats.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading skeleton */}
      {loading &&
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={styles.skeleton}>
            <div style={styles.skelName}></div>
            <div style={styles.skelButtons}>
              <div style={styles.skelBtn}></div>
              <div style={styles.skelBtn}></div>
              <div style={styles.skelBtn}></div>
            </div>
          </div>
        ))}

      {/* Student List */}
      {!loading &&
        students.map((student) => (
          <StudentRow key={student.id} student={student} onMark={handleMark} />
        ))}
    </div>
    </main>
  );
}

// Custom CSS Styles
const styles = {
  container: {
    maxWidth: "700px",
    margin: "20px auto",
    padding: "15px",
  },
  title: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "15px",
  },
  selector: {
    marginBottom: "15px",
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
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  skeleton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderRadius: "10px",
    backgroundColor: "#e5e7eb",
    marginBottom: "10px",
  },
  skelName: {
    width: "120px",
    height: "14px",
    backgroundColor: "#d1d5db",
    borderRadius: "4px",
  },
  skelButtons: {
    display: "flex",
    gap: "6px",
  },
  skelBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "#d1d5db",
  },
};
