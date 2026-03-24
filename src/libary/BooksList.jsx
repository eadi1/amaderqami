import React, { useState, useEffect } from "react";
import BookCard from "./BookCard";
import ApiManager from "../apimanger";
import { toast } from "react-toastify";
import ModalBox from "../components/modelbox";
import { Link } from "react-router-dom";

export default function BooksDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [issuerType, setIssuerType] = useState("student");

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    published_by: "",
    category: "",
    language: "",
    quantity: 1,
    available: 1,
  });

  const [issueBook, setIssueBook] = useState(null);
  const [studentName, setStudentName] = useState("");

  // Fetch all books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await ApiManager.get("/qawmi_books");
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
    fetchBooks();
  }, []);

  // Filter books locally
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = books.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        b.published_by.toLowerCase().includes(term)
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  // Add new book
  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.published_by) {
      toast.warning("সব তথ্য পূরণ করুন!");
      return;
    }

    try {
      const body = {
        title: newBook.title,
        author: newBook.author,
        published_by: newBook.published_by,
        category: newBook.category,
        language: newBook.language,
        quantity: newBook.quantity,
      };

      const res = await ApiManager.post("/qawmi_books", body);

      if (res.success) {
        const newEntry = { ...body, id: res.bookId, available: body.quantity };
        setBooks((prev) => [...prev, newEntry]);
        setFilteredBooks((prev) => [...prev, newEntry]);
        setNewBook({
          title: "",
          author: "",
          published_by: "",
          category: "",
          language: "",
          quantity: 1,
          available: 1,
        });
        toast.success("নতুন বই যোগ হয়েছে!");
        setShowModal(false);
      } else {
        toast.error("বই যোগ করতে সমস্যা হয়েছে!");
      }
    } catch (err) {
      console.error("Book add error:", err);
      toast.error("সার্ভারে সমস্যা হচ্ছে!");
    }
  };

  const handleIssue = (book) => {
    if (book.available <= 0) {
      toast.warning("এই বই বর্তমানে পাওয়া যাচ্ছে না!");
      return;
    }
    setIssueBook(book);
    setStudentName("");
    setReturnDate("");
    setIssuerType("student");
    setShowIssueModal(true);
  };

  // Confirm issue
const confirmIssue = async () => {
  // match typed title with books
  const selectedBook = books.find(
    (b) => b.title.toLowerCase() === issueBook?.title.toLowerCase()
  );

  if (!selectedBook) {
    toast.warning("বই নির্বাচন করুন!");
    return;
  }

  if (!studentName.trim()) {
    toast.warning("শিক্ষার্থী বা শিক্ষকের আইডি লিখুন!");
    return;
  }
  if (!returnDate) {
    toast.warning("ফিরানোর তারিখ নির্বাচন করুন!");
    return;
  }

  try {
    const res = await ApiManager.post("/bookissue", {
      book_id: selectedBook.id,
      uniq_id: studentName,
      issuer_type: issuerType,
      return_due: returnDate,
      quantity: 1,
    });

    if (res.success) {
      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.id === selectedBook.id
            ? { ...b, available: Math.max(b.available - 1, 0) }
            : b
        )
      );
      toast.success(`${studentName}-কে "${selectedBook.title}" বইটি ইস্যু করা হয়েছে!`);
      setShowIssueModal(false);
      setReturnDate("");
    } else {
      toast.error(res.message || "ইস্যু করতে সমস্যা হয়েছে!");
    }
  } catch (err) {
    console.error(err);
    toast.error("সার্ভারে সমস্যা হচ্ছে!");
  }
};

  return (
    <main className="main-container min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          📚 লাইব্রেরি ম্যানেজমেন্ট সিস্টেম
        </h1>

        {/* Search & Add */}
        <div className="jamat-actions mb-4 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="বইয়ের নাম, লেখক, প্রকাশক লিখুন..."
            className="input p-2 rounded w-full md:w-1/2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link to="issuedbooks" className="btn btn-view-details">
            ইস্যুকৃত বই
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-approve"
          >
            ➕ নতুন বই যোগ করুন
          </button>
           <button
            onClick={() => setShowIssueModal(true)}
            className="btn btn-add"
          >
          ইস্যু করুন
          </button>
        </div>

        {/* Books Grid */}
        {loading ? (
          <p className="text-center text-gray-500 mt-10">লোড হচ্ছে...</p>
        ) : (
          <div className="main-cards grid gap-4 md:grid-cols-3">
            {filteredBooks.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">
                কোনও বই পাওয়া যায়নি।
              </p>
            ) : (
              filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} onIssue={handleIssue} />
              ))
            )}
          </div>
        )}

        {/* Add Book Modal */}
        {showModal && (
          <ModalBox title="নতুন বই যোগ করুন" onClose={() => setShowModal(false)}>
            {["title", "author", "published_by", "category", "language"].map(
              (field, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={
                    field === "title"
                      ? "বইয়ের নাম"
                      : field === "author"
                      ? "লেখক"
                      : field === "published_by"
                      ? "প্রকাশক"
                      : field === "category"
                      ? "শ্রেণি"
                      : "ভাষা"
                  }
                  className="p-2 border rounded w-full mb-2"
                  value={newBook[field]}
                  onChange={(e) =>
                    setNewBook({ ...newBook, [field]: e.target.value })
                  }
                />
              )
            )}
            <input
              type="number"
              placeholder="মোট সংখ্যা"
              className="p-2 border rounded w-full mb-2"
              value={newBook.quantity}
              onChange={(e) =>
                setNewBook({
                  ...newBook,
                  quantity: parseInt(e.target.value),
                  available: parseInt(e.target.value),
                })
              }
            />
            <div className="modal-actions mt-4 flex gap-2">
              <button onClick={handleAddBook} className="btn btn-save">
                ✅ বই যোগ করুন
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-cancel"
              >
                ❌ বাতিল
              </button>
            </div>
          </ModalBox>
        )}

        {/* Issue Modal */}
      {/* Issue Modal */}
{/* Issue Modal */}
{showIssueModal && (
  <ModalBox
    title={`📖 বই ইস্যু করুন`}
    onClose={() => setShowIssueModal(false)}
  >
    {/* Book autocomplete input */}
    <input
      type="text"
      placeholder="বইয়ের নাম লিখুন..."
      className="p-2 border rounded w-full mb-2"
      value={issueBook?.title || ""}
      onChange={(e) => {
        const value = e.target.value;
        const matchedBook = books.find((b) =>
          b.title.toLowerCase().startsWith(value.toLowerCase())
        );
        if (matchedBook) {
          setIssueBook(matchedBook);
        } else {
          setIssueBook({ ...issueBook, title: value });
        }
      }}
      list="books-list"
    />
    <datalist id="books-list">
      {books.map((b) => (
        <option key={b.id} value={b.title} />
      ))}
    </datalist>

    {/* Student/Teacher ID input */}
    <input
      type="text"
      placeholder="শিক্ষক/শিক্ষার্থীর আইডি ..."
      className="p-2 border rounded w-full mb-2"
      value={studentName}
      onChange={(e) => setStudentName(e.target.value)}
    />

    {/* Return date */}
    <input
      type="date"
      className="p-2 border rounded w-full mb-4"
      value={returnDate}
      onChange={(e) => setReturnDate(e.target.value)}
    />

    {/* Issuer type */}
    <select
      className="p-2 border rounded w-full mb-4"
      value={issuerType}
      onChange={(e) => setIssuerType(e.target.value)}
    >
      <option value="teacher">শিক্ষক</option>
      <option value="student">শিক্ষার্থী</option>
    </select>

    {/* Quantity */}
    <input
      type="number"
      min={1}
      max={issueBook?.available || 1}
      placeholder="সংখ্যা"
      className="p-2 border rounded w-full mb-4"
      value={issueBook?.quentity || 1}
      onChange={(e) =>
        setIssueBook({ ...issueBook, quentity: parseInt(e.target.value) })
      }
    />

    {/* Modal actions */}
    <div className="modal-actions mt-4 flex gap-2">
      <button
        onClick={async () => {
          if (!issueBook || !issueBook.id) {
            toast.warning("বই নির্বাচন করুন!");
            return;
          }
          if (!studentName.trim()) {
            toast.warning("শিক্ষার্থী বা শিক্ষকের আইডি লিখুন!");
            return;
          }
          if (!returnDate) {
            toast.warning("ফিরানোর তারিখ নির্বাচন করুন!");
            return;
          }

          const quantityToIssue = issueBook.quentity || 1;

          try {
            const res = await ApiManager.post("/bookissue", {
              book_id: issueBook.id,
              uniq_id: studentName,
              issuer_type: issuerType,
              return_due: returnDate,
              quentity: quantityToIssue,
            });

            if (res.success) {
              setBooks((prevBooks) =>
                prevBooks.map((b) =>
                  b.id === issueBook.id
                    ? { ...b, available: Math.max(b.available - quantityToIssue, 0) }
                    : b
                )
              );
              toast.success(
                `${studentName}-কে "${issueBook.title}" বইটি ইস্যু করা হয়েছে!`
              );
              setShowIssueModal(false);
              setReturnDate("");
            } else {
              toast.error(res.message || "ইস্যু করতে সমস্যা হয়েছে!");
            }
          } catch (err) {
            console.error(err);
            toast.error("সার্ভারে সমস্যা হচ্ছে!");
          }
        }}
        className="btn btn-save"
      >
        ইস্যু নিশ্চিত করুন
      </button>
      <button
        onClick={() => setShowIssueModal(false)}
        className="btn btn-cancel"
      >
        ❌ বাতিল
      </button>
    </div>
  </ModalBox>
)}


      </div>
    </main>
  );
}
