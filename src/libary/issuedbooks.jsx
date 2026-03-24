import React, { useState, useEffect } from "react";
import Section from "../components/Section";
import Table from "../components/Table";

import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function IssuedBooks() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Added loading state

  // 🔹 Fetch issued books from API
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await ApiManager.get("/bookissue");
      if (res.success) {
        setBooks(res.data);
        setFilteredBooks(res.data);
      } else {
        toast.error("ডেটা লোড করতে সমস্যা হয়েছে!");
      }
    } catch (err) {
      console.error(err);
      toast.error("ডেটা লোড করতে সমস্যা হচ্ছে!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(); // ✅ Properly call async function
  }, []);

  // 🔍 Search filter
  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = books.filter(
      (b) =>
        b.issuer_name?.toLowerCase().includes(value) ||
        b.book_name?.toLowerCase().includes(value)
    );
    setFilteredBooks(filtered);
  };

const handleReturn = async (id) => {
  try {
    const res = await ApiManager.put(`/bookissue/return/${id}`);
    if (res.success) {
      toast.success("📚 বই সফলভাবে ফেরত নেওয়া হয়েছে।");

  await fetchBooks();

    } else {
      toast.error(res.message || "⚠️ বই ফেরত নেওয়া যায়নি!");
    }
  } catch (error) {
    console.error("Return Error:", error);
    toast.error("❌ সার্ভার ত্রুটি! আবার চেষ্টা করুন।");
  }
};


  // 📋 Table columns
  const columns = [
    { key: "issuer_name", label: "গ্রহণকারীর নাম" },
    { key: "book_name", label: "বইয়ের নাম" },
    { key: "return_due", label: "সম্ভাব্য ফেরেতর তারিখ" },
    { key: "quantity", label: "ইস্যু সংখ্যা" },
    { key: "returned", label: "ফেরতের সংখ্যা" },
     { key: "returned_on", label: "যে ফেরত দেওয়া হয়েছে " },
 
  ];

  // 🧾 Table data
// 🔹 Helper: English number → Bangla number
const toBanglaNumber = (num) => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => banglaDigits[d]);
};

// 🔹 Helper: English date → Bangla formatted date (DD-MM-YYYY)
const toBanglaDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = toBanglaNumber(date.getDate());
  const month = toBanglaNumber(date.getMonth() + 1);
  const year = toBanglaNumber(date.getFullYear());
  return `${day}-${month}-${year}`;
};

// 🔹 Sort by returned count: যেসব বই ফেরত দেওয়া হয়েছে, সেগুলো শেষের দিকে থাকবে
const sortedBooks = [...filteredBooks].sort((a, b) => {
  // ফেরত দেওয়া সংখ্যা অনুযায়ী ascending: 0 ফেরত, শেষের দিকে বেশি ফেরত
  return a.quentity - a.returned;
});

// 🔹 Create table data
const tableData = sortedBooks.map((b) => ({
  id:b.id,
  issuer_name: (
    
    b.issuer_type=="student" ? `${b.issuer_name} (ছাত্র/ছাত্রী)`:`${b.issuer_name} (শিক্ষক/স্টাফ)`),
  book_name: b.book_name,
  return_due: toBanglaDate(b.return_due),
  quantity: toBanglaNumber(b.quentity),
  returned: toBanglaNumber(b.returned),
  returned_on:(b.returned_on==null?"": toBanglaDate(b.returned_on)),
  action:
    b.quentity > b.returned ? (
      <button
        onClick={() => handleReturn(b.id)}
        className="btn btn-add"
      >
        ফেরত নিন
      </button>
    ) : (
      <span className="text-gray-400">ফেরত দেওয়া হয়েছে</span>
    ),
}));



  return (
    <main className="main-container">

         {/* ✅ ToastContainer অবশ্যই রাখা প্রয়োজন */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Section title="ইস্যুকৃত বইয়ের তালিকা">
        <div className="jamat-actions mb-4 flex justify-between items-center">
          <input
            className="input border px-3 py-2 rounded w-full"
            type="text"
            placeholder="শিক্ষার্থী বা বইয়ের নাম দিয়ে অনুসন্ধান করুন..."
            value={search}
            onChange={handleFilter}
          />
        </div>


<Table columns={columns} data={tableData}/>
        {loading && <p className="text-center mt-4">ডেটা লোড হচ্ছে...</p>}
      </Section>
    </main>
  );
}
