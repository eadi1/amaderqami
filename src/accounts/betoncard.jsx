import React, { useState } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";

export default function Betocard() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  // ✅ Month List (Bangla)
  const months = [
    "জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
    "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"
  ];

  // ✅ Dynamic Columns (Table component compatible)
  const columns = [
    { key: "fee_type_name", label: "ফি টাইপ" },
    ...months.map(m => ({ key: m, label: m }))
  ];

  // ✅ Search Handler
  const fetchStudentFees = async () => {
    if (!studentId) {
      toast.error("শিক্ষার্থী আইডি দিন");
      return;
    }

    try {
      setLoading(true);

      /**
       * Expected API response:
       * [
       *  { fee_type_name, month_bn, paid_amount }
       * ]
       */
      const res = await ApiManager.get(
        `/accounting/student-fees/month-wise?student_id=${studentId}`
      );

      const apiData = res.data || res;

      // 🔁 Convert API data → Table format
      const rows = [];

      apiData.forEach(item => {
        let row = rows.find(
          r => r.fee_type_name === item.fee_type_name
        );

        if (!row) {
          row = { fee_type_name: item.fee_type_name };
          months.forEach(m => (row[m] = "বকেয়া"));
          rows.push(row);
        }

        row[item.month_bn] =
          parseFloat(item.paid_amount) > 0
            ? `৳ ${item.paid_amount}`
            : "বকেয়া";
      });

      setTableData(rows);

      if (rows.length === 0) {
        toast.info("কোনো ডাটা পাওয়া যায়নি");
      }
    } catch (err) {
      console.error(err);
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container">
      <ToastContainer position="top-right" />

      <h3>শিক্ষার্থীর বেতন / ফি রিপোর্ট</h3>

      {/* 🔍 Search Section */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="শিক্ষার্থী আইডি লিখুন"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="input"
        />

        <button
          className="btn btn-primary"
          onClick={fetchStudentFees}
        >
          অনুসন্ধান
        </button>
      </div>

      {/* 📊 Table */}
      {loading && <p>লোড হচ্ছে...</p>}

      {!loading && tableData.length > 0 && (
        <Table columns={columns} data={tableData} />
      )}
    </main>
  );
}
