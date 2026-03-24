import React, { useState, useEffect } from "react";
import "./ManualDueEntry.css";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManualDueEntry() {
  const [classes, setClasses] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedFee, setSelectedFee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isMonthRequired, setIsMonthRequired] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [checkedStudents, setCheckedStudents] = useState({});
  const [checkAll, setCheckAll] = useState(false);
  const [defaultAmount, setDefaultAmount] = useState(0);

  const months = [
    { value: 1, label: "জানুয়ারি" },
    { value: 2, label: "ফেব্রুয়ারি" },
    { value: 3, label: "মার্চ" },
    { value: 4, label: "এপ্রিল" },
    { value: 5, label: "মে" },
    { value: 6, label: "জুন" },
    { value: 7, label: "জুলাই" },
    { value: 8, label: "আগস্ট" },
    { value: 9, label: "সেপ্টেম্বর" },
    { value: 10, label: "অক্টোবর" },
    { value: 11, label: "নভেম্বর" },
    { value: 12, label: "ডিসেম্বর" },
  ];

  // Fetch all jamats
  const fetchJamats = async () => {
    try {
      const data = await ApiManager.get("/jamat");
      setClasses(data);
    } catch (err) {
      console.error(err);
      toast.error("Jamats নিয়ে আসতে সমস্যা হয়েছে!");
    }
  };

  // Fetch all fee types
  const fetchFeeTypes = async () => {
    try {
      const data = await ApiManager.get("/accounting/fee-types");
      setFeeTypes(data);
    } catch (err) {
      console.error(err);
      toast.error("Fee Type লোড করতে সমস্যা হয়েছে!");
    }
  };

  useEffect(() => {
    fetchJamats();
    fetchFeeTypes();
  }, []);

  // Handle Fee Type change
  const handleFeeTypeChange = (feeId) => {
    setSelectedFee(feeId);
    const fee = feeTypes.find((f) => f.id == feeId);
    setIsMonthRequired(fee?.is_recurring === 1);

    // set default amount for all students
    const amt = fee?.amount ?? fee?.price ?? 0;
    setDefaultAmount(amt);

    // Auto select current month if recurring
    if (fee?.is_recurring === 1) {
      setSelectedMonth(new Date().getMonth() + 1);
    } else {
      setSelectedMonth("");
    }
  };

  // Load students
  const handleNext = async () => {
    if (!selectedClass || !selectedFee || (isMonthRequired && !selectedMonth)) {
      toast.warning("সব তথ্য নির্বাচন করুন!");
      return;
    }

    try {
      const res = await ApiManager.get(`/student/jamat/${selectedClass}`);
      setStudents(res);
      setShowTable(true);
      setCheckedStudents({});
      setCheckAll(false);
    } catch (err) {
      console.error(err);
      toast.error("স্টুডেন্ট ডেটা লোড করতে সমস্যা হয়েছে!");
    }
  };

  // Handle single checkbox
  const handleCheck = (id) => {
    setCheckedStudents((prev) => {
      const newState = {
        ...prev,
        [id]: {
          ...prev[id],
          checked: !prev[id]?.checked,
          amount: prev[id]?.amount ?? defaultAmount,
        },
      };
      const allChecked = students.every((s) => newState[s.id]?.checked);
      setCheckAll(allChecked);
      return newState;
    });
  };

  // Handle check all
  const handleCheckAll = () => {
    const newCheckAll = !checkAll;
    setCheckAll(newCheckAll);

    const newChecked = {};
    students.forEach((s) => {
      newChecked[s.id] = {
        checked: newCheckAll,
        amount: defaultAmount,
      };
    });
    setCheckedStudents(newChecked);
  };

  // Handle amount change
  const handleAmountChange = (id, value) => {
    setCheckedStudents((prev) => ({
      ...prev,
      [id]: { ...prev[id], amount: parseFloat(value) || 0 },
    }));
  };

  // Submit selected students
  const handleSubmit = async () => {
    const selected = Object.entries(checkedStudents)
      .filter(([_, val]) => val.checked)
      .map(([id, val]) => ({
        student_id: id,
        amount: Number(val.amount) || 0,
      }));

    if (selected.length === 0) {
      toast.warning("কোন স্টুডেন্ট নির্বাচন করা হয়নি!");
      return;
    }

    try {
      await ApiManager.post("/accounting/manual-due-entry", {
        jamat: selectedClass,
        fee_type: selectedFee,
        month: isMonthRequired ? selectedMonth : 0,
        students: selected,
      });
      toast.success("ম্যানুয়াল ডিউ এন্ট্রি সফল হয়েছে!");
      setShowTable(false);
      setCheckedStudents({});
      setCheckAll(false);
    } catch (err) {
      console.error(err);
      toast.error("সেভ করার সময় সমস্যা হয়েছে!");
    }
  };

  return (
    <main className="main-container">
      <div className="manual-due-container">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <h2 className="page-title">🧾 ম্যানুয়াল ডিউ এন্ট্রি</h2>

        {/* Step 1: Filter Section */}
        <div className="filter-box">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- জামাত নির্বাচন করুন --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            value={selectedFee}
            onChange={(e) => handleFeeTypeChange(e.target.value)}
          >
            <option value="">-- ফি টাইপ নির্বাচন করুন --</option>
            {feeTypes
              .filter((f) => f.preallocated !== 1)
              .map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
          </select>

          {isMonthRequired && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">-- মাস নির্বাচন করুন --</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          )}

          <button
            className="btn-next"
            onClick={handleNext}
            disabled={!selectedClass || !selectedFee || (isMonthRequired && !selectedMonth)}
          >
            ➡️ Next
          </button>
        </div>

        {/* Step 2: Student List */}
        {showTable && students.length > 0 && (
          <div className="student-table">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={checkAll}
                      onChange={handleCheckAll}
                    />
                  </th>
                  <th>নাম</th>
                  <th>রোল</th>
                  <th>ফি টাইপ</th>
                  <th>পরিমাণ (৳)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const studentData = checkedStudents[s.id] || {};
                  return (
                    <tr key={s.id} className={studentData.checked ? "selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={studentData.checked || false}
                          onChange={() => handleCheck(s.id)}
                        />
                      </td>
                      <td>{s.name}</td>
                      <td>{s.roll}</td>
                      <td>{feeTypes.find((f) => f.id == selectedFee)?.name || ""}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={studentData.amount ?? defaultAmount}
                          onChange={(e) => handleAmountChange(s.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="actions">
              <button className="btn-back" onClick={() => setShowTable(false)}>
                ⬅️ পিছনে যান
              </button>
              <button
                className="btn-save"
                onClick={handleSubmit}
                disabled={Object.values(checkedStudents).filter(s => s.checked).length === 0}
              >
                💾 সংরক্ষণ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
