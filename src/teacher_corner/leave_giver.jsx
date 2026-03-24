import React, { useEffect, useState } from "react";
import ApiManager from "../apimanger";
import { toast } from "react-toastify";
import Table from "../components/Table";
import ModelBox from "../components/modelbox";
import Cookies from "js-cookie";

export default function LeaveManagement() {
  const formatBanglaDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const [leaves, setLeaves] = useState([]);
  const [showModel, setShowmodel] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const role = Cookies.get("role");

  const [currentLeave, setCurrentLeave] = useState({
    student_id: "",
    from_date: "",
    to_date: "",
    reason: "",
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  // 🔹 Fetch Leave List
  const fetchLeaves = async () => {
    try {
      const data = await ApiManager.get("/leave");
      setLeaves(data);
    } catch {
      toast.error("ছুটি তালিকা লোড করতে সমস্যা!");
    }
  };

  // 🔹 Calculate Days
  const calculateDays = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const diffTime = end - start;
    const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;
    return diffDays;
  };

  // 🔥 Save Leave
  const saveLeave = async () => {
    if (!currentLeave.from_date || !currentLeave.to_date || !currentLeave.student_id) {
      toast.error("সব ঘর পূরণ করুন!");
      return;
    }

    const totalDays = calculateDays(currentLeave.from_date, currentLeave.to_date);

    if (role !== "administrator" && totalDays > 3) {
      toast.warning("আপনি সর্বোচ্চ ৩ দিনের ছুটি দিতে পারবেন!");
      return;
    }

    try {
      setSubmitting(true);
      await ApiManager.post("/leave", {
        ...currentLeave,
        total_days: totalDays,
      });
      toast.success("ছুটি সফলভাবে যোগ হয়েছে!");
      setShowmodel(false);
      setCurrentLeave({
        student_id: "",
        from_date: "",
        to_date: "",
        reason: "",
      });
      fetchLeaves();
    } catch (err) {
      console.error(err);
      toast.error("ছুটি যোগ করতে সমস্যা!");
    } finally {
      setSubmitting(false);
    }
  };

 // ❌ Delete Leave
  const deleteLeave = async (student_id, from_date, to_date) => {
    // তারিখগুলো সুন্দরভাবে ফরম্যাট করে কনফার্মেশন মেসেজ তৈরি
    const message = `${formatBanglaDate(from_date)} হইতে ${formatBanglaDate(to_date)} পর্যন্ত ছুটি বাতিল করতে চান?`;
    
    if (!window.confirm(message)) return;

    try {
      // ব্যাকএন্ডে from_date এবং to_date উভয়ই পাঠানো হচ্ছে
      await ApiManager.delete(`/leave/${student_id}/${from_date}/${to_date}`);
      
      toast.success("ছুটি সফলভাবে বাতিল হয়েছে!");
      fetchLeaves(); // তালিকা রিফ্রেশ করুন
    } catch (err) {
      console.error(err);
      toast.error("বাতিল করতে সমস্যা হয়েছে!");
    }
  };
  // =============================
  // 🔹 Remove duplicates & group by student
  // =============================
  const groupedLeaves = {};
  leaves.forEach((l) => {
    const studentId = l.student_id;
    const studentName = l.student_name;
    const date = l.attendance_date.substring(0, 10);
    if (!groupedLeaves[studentId]) {
      groupedLeaves[studentId] = { student_id: studentId, student_name: studentName, dates: new Set() };
    }
    groupedLeaves[studentId].dates.add(date);
  });

  // 🔹 Convert each student's Set of dates to ranges
  const leaveData = Object.entries(groupedLeaves)
    .map(([student_id, data]) => {
      const { student_name, dates } = data;
      const sortedDates = Array.from(dates).sort((a, b) => new Date(a) - new Date(b)); // ascending to form ranges

      const ranges = [];
      if (sortedDates.length === 0) return { student_id, student_name, ranges };

      let start = sortedDates[0];
      let currentEnd = sortedDates[0];

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(currentEnd);
        const currDate = new Date(sortedDates[i]);
        const diffInDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (diffInDays === 1) {
          currentEnd = sortedDates[i];
        } else {
          ranges.push({ from: start, to: currentEnd });
          start = sortedDates[i];
          currentEnd = sortedDates[i];
        }
      }
      ranges.push({ from: start, to: currentEnd });

      return { student_id, student_name, ranges };
    })
    .map((student) => {
      // sort ranges descending by "to" date
      student.ranges.sort((a, b) => new Date(b.to) - new Date(a.to));
      return student;
    })
    .sort((a, b) => {
      // sort students by their latest leave's "to" date
      const aLatest = a.ranges[0]?.to ? new Date(a.ranges[0].to) : 0;
      const bLatest = b.ranges[0]?.to ? new Date(b.ranges[0].to) : 0;
      return bLatest - aLatest;
    });

  // 🔹 Prepare Table Data
  const data = leaveData.flatMap((student) =>
    student.ranges.map((r) => {
      const today = new Date();
      const fromDate = new Date(r.from);
      const toDate = new Date(r.to);
      let status = "";

      if (today < fromDate) status = "আসন্ন ছুটি";
      else if (today > toDate) status = "ছুটি শেষ";
      else status = "চলমান ছুটি";

      return {
        student_name: student.student_name || "নাম নেই",
        student_id: student.student_id,
        from: formatBanglaDate(r.from),
        to: formatBanglaDate(r.to),
        status,
        action: (
          <button
            className="btn btn-delete"
            onClick={() => deleteLeave(student.student_id, 
           //today theke from date boro hole fromdate e hbe r chotot hole today e hbe from date r to date hbe to date r to date
            r.from > new Date().toISOString().substring(0, 10) ? r.from : new Date().toISOString().substring(0, 10), 
            r.to)}
          >
            বাতিল
          </button>
        ),
      };
    })
  );

  const columns = [
    { key: "student_name", label: "ছাত্রের নাম" },
    { key: "student_id", label: "স্টুডেন্ট আইডি" },
    { key: "from", label: "হইতে" },
    { key: "to", label: "পর্যন্ত" },
    { key: "status", label: "স্ট্যাটাস" },

  ];

  return (
    <main className="main-container">
      <button className="btn btn-add" onClick={() => setShowmodel(true)}>
        নতুন ছুটি দিন
      </button>

      <Table columns={columns} data={data} />

      {/* ------------ MODAL ------------ */}
      {showModel && (
        <ModelBox onClose={() => setShowmodel(false)} title="ছুটি দিন">
          <div className="modal-form-row">
            <label>স্টুডেন্ট আইডি</label>
            <input
              value={currentLeave.student_id}
              onChange={(e) =>
                setCurrentLeave({ ...currentLeave, student_id: e.target.value })
              }
            />
          </div>

          <div className="modal-form-row">
            <label>শুরুর তারিখ</label>
            <input
              type="date"
              value={currentLeave.from_date}
              onChange={(e) =>
                setCurrentLeave({ ...currentLeave, from_date: e.target.value })
              }
            />
          </div>

          <div className="modal-form-row">
            <label>শেষ তারিখ</label>
            <input
              type="date"
              value={currentLeave.to_date}
              onChange={(e) =>
                setCurrentLeave({ ...currentLeave, to_date: e.target.value })
              }
            />
          </div>

          <div className="modal-form-row">
            <label>কারণ</label>
            <textarea
              value={currentLeave.reason}
              onChange={(e) =>
                setCurrentLeave({ ...currentLeave, reason: e.target.value })
              }
              style={{ width: "95%", height: "120px" }}
            />
          </div>

          <button
            className="btn btn-save"
            onClick={saveLeave}
            disabled={submitting}
          >
            {submitting ? "প্রসেস হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
        </ModelBox>
      )}
    </main>
  );
}
