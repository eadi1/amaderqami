import React, { useState, useEffect, useRef } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import Cookies from "js-cookie";
import Buttons from "../components/buttons";


export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [funds, setFunds] = useState([]);
  
  // কোন রশিদের ডিটেইলস খোলা তা ট্র্যাক করার জন্য
  const [openReceiptId, setOpenReceiptId] = useState(null);

  const [studentIdFilter, setStudentIdFilter] = useState("");
  const [jamatFilter, setJamatFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [deleteTarget, setDeleteTarget] = useState({ boi: "", roshid: "" });
const [adminPassword, setAdminPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  const [receiptBooks, setReceiptBooks] = useState([]);
  const [selectedBoi, setSelectedBoi] = useState("");
  const [selectedPage, setSelectedPage] = useState("");
  const [availablePages, setAvailablePages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const debounceRef = useRef(null);
const role=Cookies.get("role"); // Assuming role is stored in cookies
  // ✅ Helper Functions
  function toBanglaNumber(number) {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return number ? number.toString().split("").map(d => banglaDigits[d] ?? d).join("") : "০";
  }

  function formatDate(dateStr, useBanglaMonth = false) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const banglaMonths = ["", "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    if (useBanglaMonth) {
      return `${toBanglaNumber(date.getDate())} ${banglaMonths[date.getMonth() + 1]} ${toBanglaNumber(date.getFullYear())}`;
    }
    return `${toBanglaNumber(date.getDate())}-${toBanglaNumber(date.getMonth() + 1)}-${toBanglaNumber(date.getFullYear())}`;
  }

  // ✅ Fetching Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, fundRes, bookRes] = await Promise.all([
        ApiManager.get("/accounting/payments"),
        ApiManager.get("/accounting/funds"),
        ApiManager.get("/receipt-book/list")
      ]);
      setPayments(payRes || []);
      setFilteredPayments(payRes || []);
      setFunds(fundRes || []);
      setReceiptBooks(bookRes.data || bookRes || []);
    } catch (err) {
      toast.error("ডেটা লোড করতে সমস্যা!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ✅ Toggle Details Function
  const toggleDetails = (id) => {
    setOpenReceiptId(openReceiptId === id ? null : id);
  };


// যখন ডিলিট বাটনে ক্লিক করবেন
const openConfirmModal = (boi, roshid) => {
  if (role !== 'administrator') {
    return toast.error("দুঃখিত, শুধুমাত্র অ্যাডমিন এটি ডিলিট করতে পারবেন।");
  }
  setDeleteTarget({ boi, roshid });
  setAdminPassword(""); // ফিল্ড রিসেট
  setIsDeleteModalOpen(true);
};

// মোডাল থেকে 'Confirm' এ ক্লিক করলে এই ফাংশনটি চলবে
const processDelete = async () => {
  if (!adminPassword) return toast.warning("পাসওয়ার্ড দিন।");

  try {
    const response = await ApiManager.delete(
      `/accounting/payments/receipt/${deleteTarget.boi}/${deleteTarget.roshid}`, 
      { password: adminPassword }
    );

    if (response.success) {
      toast.success(response.message || "ডিলিট সফল ✅");
      setIsDeleteModalOpen(false); // মোডাল বন্ধ
      fetchData(); // ডাটা রিফ্রেশ
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || "ভুল পাসওয়ার্ড বা সার্ভার সমস্যা!";
    toast.error(errorMessage);
    // ভুল পাসওয়ার্ড দিলে অনেক সময় সার্ভার ৪০১ দেয়, তাই রিফ্রেশ এড়াতে চেক করুন
  }
};
  const handleDeleteReceipt = async (boiNumber, roshidNumber, refreshData) => {
  // ১. প্রথমেই রোল চেক করুন (Client-side protection)
  if (role !== 'administrator') {
    return toast.error("দুঃখিত, শুধুমাত্র অ্যাডমিন এটি ডিলিট করতে পারবেন।");
  }

  // ২. কনফার্মেশন এবং পাসওয়ার্ড সংগ্রহ
  const isConfirmed = window.confirm(`আপনি কি নিশ্চিত যে বই নং ${boiNumber}, রশিদ নং ${roshidNumber} এর সকল পেমেন্ট ডিলিট করতে চান? এটি ডিউ অ্যামাউন্ট পুনরায় বাড়িয়ে দেবে।`);
  
  if (!isConfirmed) return;

  const password = window.prompt("নিরাপত্তার জন্য আপনার অ্যাডমিন পাসওয়ার্ডটি দিন!!!!! ভুল পাসওয়ার্ড দিলে লগআউট হতে পারেন।");

  if (!password) {
    return toast.warning("পাসওয়ার্ড ছাড়া ডিলিট করা সম্ভব নয়।");
  }

  try {
    // ৩. ডিলিট রিকোয়েস্ট পাঠানো (বডিতে পাসওয়ার্ড সহ)
    const response = await ApiManager.delete(
      `/accounting/payments/receipt/${boiNumber}/${roshidNumber}`, 
      {
        password // Axios এ DELETE মেথডে বডি পাঠাতে 'data' কী ব্যবহার করতে হয়
      }
    );

    if (response.success) {
      toast.success(response.message || "রশিদটি সফলভাবে ডিলিট করা হয়েছে ✅");
      
      // ৪. ডাটা রিফ্রেশ করার ফাংশন কল করা (যাতে টেবিল আপডেট হয়)
      if (refreshData) refreshData();
    }
  } catch (err) {
    // ৫. এরর হ্যান্ডলিং
    const errorMessage = err.response?.data?.message || "ডিলিট করার সময় সমস্যা হয়েছে!";
    toast.error(errorMessage);
    console.error("Delete Error:", err);
  }
};
  // ✅ Filtering
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      let filtered = payments.filter(p => {
        const matchStudent = studentIdFilter ? p.student_id.toString().includes(studentIdFilter) : true;
        const matchJamat = jamatFilter ? p.jamat_name.includes(jamatFilter) : true;
        const matchFrom = fromDate ? new Date(p.payment_date) >= new Date(fromDate) : true;
        const matchTo = toDate ? new Date(p.payment_date) <= new Date(toDate) : true;
        return matchStudent && matchJamat && matchFrom && matchTo;
      });
      setFilteredPayments(filtered);
      setCurrentPage(1);
    }, 300);
  }, [studentIdFilter, jamatFilter, fromDate, toDate, payments]);

 
  // ✅ Table Columns
  const columns = [
    { key: "receipt_info", label: "বই ও রশিদ" },
    { key: "student_id", label: "শিক্ষার্থী আইডি" },
    { key: "studentname", label: "শিক্ষার্থী নাম" },
    { key: "jamat_name", label: "জামাত" },

    { key: "total_amount", label: "মোট টাকা" },
    { key: "payment_date", label: "তারিখ" },
    
  ];

  // ✅ Data Mapping
  const data = payments.map((p, index) => {
    const uniqueId = `${p.boi_number}-${p.roshid_number}`;
    const isOpen = openReceiptId === uniqueId;

    return {
      receipt_info:`${toBanglaNumber(p.roshid_number)}/${toBanglaNumber(p.boi_number)}`,
      studentname: p.student_name,
          
      
      jamat_name: p.jamat_name,
      student_id: toBanglaNumber(p.student_id),
      total_amount:toBanglaNumber(p.total_amount),
      payment_date: formatDate(p.payment_date, true),
      action: (
     <>  
    <Buttons 
      type="delete" 
      onClick={() => openConfirmModal(p.boi_number, p.roshid_number)} 
    />  
     <Buttons 
      type="print" 
      onClick={() => navigate(`/pdf_reciet/${p.boi_number}/${p.roshid_number}`)} 
    />  
    
      <div style={{ position: "relative" }}>
          
          <button 
            className={`btn ${isOpen ? 'btn-delete' : 'btn-approve'}`} 
            onClick={() => toggleDetails(uniqueId)}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            {isOpen ? "বন্ধ করুন" : "বিস্তারিত"}
          </button>



          {/* বিস্তারিত ফি এর তালিকা (ট্রানজিশন সহ) */}
          <div style={{
            maxHeight: isOpen ? "300px" : "0px",
            overflowY: "auto",
            transition: "all 0.4s ease-in-out",
            background: "#f9f9f9",
            position: "absolute",
            right: 0,
            top: "40px",
            zIndex: 10,
            width: "250px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            borderRadius: "5px",
            border: isOpen ? "1px solid #ddd" : "none"
          }}>
            <ul style={{ listStyle: "none", padding: "10px", margin: 0, textAlign: "left" }}>
              <li style={{ borderBottom: "1px solid #eee", paddingBottom: "5px", marginBottom: "5px", fontWeight: "bold" }}>ফি এর বিবরণ:</li>
              {p.fees.map((f, i) => (
                <li key={i} style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span>{f.fee_name}</span>
                  <b>{toBanglaNumber(f.amount)} ৳</b>
                </li>
              ))}
            </ul>
          </div>
        </div></>
      )
    };
  });

  return (
    <main className="main-container">
      <ToastContainer />
      <div className="jamat-mangement"><h3>আদায়ের বিবরণ (রশিদ ভিত্তিক)</h3></div>

      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="শিক্ষার্থী আইডি" className="input" value={studentIdFilter} onChange={(e) => setStudentIdFilter(e.target.value)} />
        <input type="text" placeholder="জামাত" className="input" value={jamatFilter} onChange={(e) => setJamatFilter(e.target.value)} />
        <input type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="btn btn-add" onClick={() => setShowModal(true)}>রশিদ খুঁজুন</button>
      </div>

      {loading ? <p>লোড হচ্ছে...</p> : <Table columns={columns} data={data} />}

   {isDeleteModalOpen && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  }}>
    <div style={{
      background: '#fff', padding: '25px', borderRadius: '12px', width: '350px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center'
    }}>
      <h3 style={{ marginBottom: '10px', color: '#d32f2f' }}>⚠️ সতর্কতা!</h3>
      <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
        বই: <b>{toBanglaNumber(deleteTarget.boi)}</b>, রশিদ: <b>{toBanglaNumber(deleteTarget.roshid)}</b> এর সকল পেমেন্ট ডিলিট করতে চান?
      </p>

      {/* Password Input Field with Hide/Show */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input 
          type={showPassword ? "text" : "password"}
          className="input"
          placeholder="অ্যাডমিন পাসওয়ার্ড দিন"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          //max width কমিয়ে দিয়ে একটু স্টাইলিং করা হয়েছে যাতে পাসওয়ার্ড ইনপুট ফিল্ডের পাশে আইকনটা ঠিক থাকে

          style={{ maxWidth: '100%', padding: '10px 20px' }}
        />
        <button 
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'
          }}
        >
          {showPassword ? "👁️‍🗨️" : "👁️"}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="btn btn-delete" onClick={processDelete}>ডিলিট করুন</button>
        <button className="btn btn-approve" onClick={() => setIsDeleteModalOpen(false)}>বাতিল</button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}