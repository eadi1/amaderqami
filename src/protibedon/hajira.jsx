import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AttendanceReportPDF from "../pdf/hajirakhata.jsx";

const toBanglaDigit = (num) => {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bn[d]);
};

const isFriday = (dateString) => {
  const date = new Date(dateString);
  return date.getDay() === 5;
};

const normalizeDate = (dateStr) => {
  return new Date(dateStr).toISOString().split("T")[0];
};

export default function MonthlyAttendance() {
  const [jamats, setJamats] = useState([]);
  const [filterJamat, setFilterJamat] = useState("");
  const [monthYear, setMonthYear] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceDates, setAttendanceDates] = useState([]);

  useEffect(() => {
    fetchJamats();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("jamat")) setFilterJamat(urlParams.get("jamat"));
    if (urlParams.get("monthYear")) setMonthYear(urlParams.get("monthYear"));
  }, []);

  const fetchJamats = async () => {
    try {
      const data = await ApiManager.get("/jamat");
      setJamats(data);
    } catch {
      toast.error("শ্রেণির তথ্য লোড করতে সমস্যা হয়েছে!");
    }
  };

  const fetchAttendance = async () => {
    if (!filterJamat || !monthYear) {
      toast.error("শ্রেণি এবং মাস নির্বাচন করুন!");
      return;
    }

    try {
      const url = `/attandance/jamat/${filterJamat}/month/${monthYear}`;
      const data = await ApiManager.get(url);

      const normalized = (data || []).map((student) => ({
        ...student,
        attendance: student.attendance.map((a) => ({
          ...a,
          date: normalizeDate(a.date),
        })),
      }));
      setAttendanceData(normalized);

      const [year, month] = monthYear.split("-");
      const totalDays = new Date(year, month, 0).getDate();
      const allDates = Array.from({ length: totalDays }, (_, i) => {
        const day = (i + 1).toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      });
      setAttendanceDates(allDates);
    } catch (err) {
      toast.error("তথ্য আনতে সমস্যা হয়েছে!");
    }
  };

  return (
    <main className="main-container">
      <ToastContainer />
      <div className="student-management">
        <h1>মাসিক হাজিরা রিপোর্ট</h1>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <select value={filterJamat} onChange={(e) => setFilterJamat(e.target.value)}>
            <option value="">শ্রেণি নির্বাচন করুন</option>
            {jamats.map((j) => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>

          <input type="month" value={monthYear} onChange={(e) => setMonthYear(e.target.value)} />

          <button onClick={fetchAttendance} className="btn btn-add">অনুসন্ধান</button>

          {attendanceData.length > 0 && (
            <PDFDownloadLink
              document={
                <AttendanceReportPDF
                  students={attendanceData}
                  monthYear={monthYear}
                  className={jamats.find((j) => j.id == filterJamat)?.name || ""}
                />
              }
              fileName={`Attendance_${monthYear}.pdf`}
            >
              {({ loading }) => (
                <button className="btn btn-download">{loading ? "লোডিং..." : "পিডিএফ ডাউনলোড"}</button>
              )}
            </PDFDownloadLink>
          )}
        </div>

        {attendanceData.length > 0 && (
          <div style={{ overflowX: "auto", background: "#fff", padding: "10px" }}>
            <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#0062D2", color: "#fff" }}>
                  <th style={{ padding: "10px" }}>নাম</th>
                  <th>রোল</th>
                  {attendanceDates.map((date) => (
                    <th key={date} style={{ backgroundColor: isFriday(date) ? "#FFD700" : "", color: isFriday(date) ? "#000" : "#fff", minWidth: "30px" }}>
                      {toBanglaDigit(parseInt(date.split("-")[2]))}
                    </th>
                  ))}
                  <th style={{ backgroundColor: "#28a745", color: "#fff" }}>উ:</th>
                  <th style={{ backgroundColor: "#dc3545", color: "#fff" }}>অ:</th>
                  <th style={{ backgroundColor: "#ffc107", color: "#000" }}>ছ:</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((student) => {
                  // কাউন্টিং লজিক
                  const pCount = student.attendance.filter(a => a.status.toLowerCase() === 'p').length;
                  const aCount = student.attendance.filter(a => a.status.toLowerCase() === 'a').length;
                  const lCount = student.attendance.filter(a => a.status.toLowerCase() === 'l').length;

                  return (
                    <tr key={student.id}>
                      <td style={{ textAlign: "left", padding: "8px" }}>{student.name}</td>
                      <td>{toBanglaDigit(student.roll)}</td>
                      {attendanceDates.map((date) => {
                        const att = student.attendance.find((a) => a.date === date);
                        const friday = isFriday(date);
                        return (
                          <td key={date} style={{ backgroundColor: friday ? "#fef3c7" : "" }}>
                            {friday ? "ব" : (
                              att ? (
                                att.status.toLowerCase() === "p" ? "হ" :
                                att.status.toLowerCase() === "l" ? "ছ" :
                                att.status.toLowerCase() === "a" ? "অ" : "-"
                              ) : "-"
                            )}
                          </td>
                        );
                      })}
                      {/* টোটাল কলামসমূহ */}
                      <td style={{ fontWeight: "bold", color: "#28a745" }}>{toBanglaDigit(pCount)}</td>
                      <td style={{ fontWeight: "bold", color: "#dc3545" }}>{toBanglaDigit(aCount)}</td>
                      <td style={{ fontWeight: "bold", color: "#856404" }}>{toBanglaDigit(lCount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}