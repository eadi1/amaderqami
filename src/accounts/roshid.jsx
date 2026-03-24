import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Section from "../components/Section";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
const BASE_URL = import.meta.env.VITE_API_URL || "";
function RoshidManagement() {
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState({ boi_number: "", start_page: "", end_page: "" });
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/receipt-book/list");
      setBooks(data);
    } catch (err) {
      toast.error("রশিদ বই লোড করতে সমস্যা হয়েছে!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentBook({ boi_number: "", start_page: "", end_page: "" });
    setNextPage(null);
    setShowModal(true);
  };

  const handleNextPage = async (boi_number) => {
    if (!boi_number) return;
    try {
      const res = await ApiManager.get(`/receipt-book/next/${boi_number}`);
      setNextPage(res.next_receipt || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    const { boi_number, start_page, end_page } = currentBook;
    if (!boi_number || !start_page || !end_page) return toast.warning("সব ফিল্ড পূরণ করুন!");

    try {
      await ApiManager.post("/receipt-book/create", currentBook);
      toast.success("রশিদ বই যুক্ত হয়েছে ✅");
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.error || "সংরক্ষণে সমস্যা হয়েছে!");
      console.error(err);
    }
  };

  const handleUsePage = async (boi_number) => {
    if (!nextPage || typeof nextPage !== "number") {
      toast.warning("আগের পৃষ্ঠা ব্যবহার শেষ হয়েছে!");
      return;
    }

    if (!window.confirm(`পরবর্তী পৃষ্ঠা (${nextPage}) ব্যবহার করতে চান?`)) return;

    try {
      await ApiManager.post("/receipt-book/use-page", { boi_number, page_number: nextPage });
      toast.success(`পৃষ্ঠা ${nextPage} ব্যবহৃত হয়েছে ✅`);
      handleNextPage(boi_number);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.error || "পৃষ্ঠা ব্যবহারে সমস্যা!");
      console.error(err);
    }
  };

  const columns = [
    { key: "boi_number", label: "বই নম্বর" },
    { key: "total_pages", label: "মোট পৃষ্ঠা" },
    { key: "used_pages", label: "ব্যবহৃত পৃষ্ঠা" },
    { key: "remaining_pages", label: "বাকি পৃষ্ঠা" },
  ];

  const tableData = books.map((b) => ({
    id: b.boi_number,
    boi_number: b.boi_number,
    total_pages: b.total_pages,
    used_pages: Array.isArray(b.used_pages) ? b.used_pages.join(", ") : "",
    remaining_pages: b.remaining_pages,
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <Section>
        <div className="jamat-management">
          <h1>রশিদ বই ব্যবস্থাপনা</h1>
          <button className="btn btn-add" onClick={handleAdd}>নতুন রশিদ বই যুক্ত করুন</button>

          {loading ? <p>লোড হচ্ছে...</p> : <Table columns={columns} data={tableData} />}

          {showModal && (
            <ModalBox title="নতুন রশিদ বই যুক্ত করুন">
              <input
                type="number"
                value={currentBook.boi_number}
                onChange={(e) => setCurrentBook({ ...currentBook, boi_number: e.target.value })}
                placeholder="বই নম্বর"
              />
              <input
                type="number"
                value={currentBook.start_page}
                onChange={(e) => setCurrentBook({ ...currentBook, start_page: e.target.value })}
                placeholder="শুরুর পৃষ্ঠা"
              />
              <input
                type="number"
                value={currentBook.end_page}
                onChange={(e) => setCurrentBook({ ...currentBook, end_page: e.target.value })}
                placeholder="শেষ পৃষ্ঠা"
              />
              <div className="modal-actions">
                <button className="btn btn-save" onClick={handleSave}>💾 সংরক্ষণ</button>
                <button className="btn btn-cancel" onClick={() => setShowModal(false)}>❌ বাতিল</button>
              </div>
            </ModalBox>
          )}
        </div>
      </Section>
    </main>
  );
}

export default RoshidManagement;
        