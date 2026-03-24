import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

export default function DonarList() {
  const [loading, setLoading] = useState(false);
  const [donars, setDonars] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const emptyDonar = {
    id: null,
    doner_id: "",
    name: "",
    phone_number: "",
    amount: "",
    address: "",
    is_requring: false,
  };

  const [newDonar, setNewDonar] = useState(emptyDonar);

  // 🔹 Fetch donors
  const fetchDoner = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/donar");
      setDonars(data || []);
    } catch {
      toast.error("দাতা লোড করতে ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoner();
  }, []);

  // 🔹 Edit donor
  const handleEdit = (donar) => {
    setNewDonar({
      ...donar,
      is_requring: Boolean(donar.is_requring),
    });
    setShowModal(true);
  };

  // 🔹 Delete donor
  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই দাতাকে মুছে ফেলতে চান?")) return;

    try {
      await ApiManager.delete(`/donar/${id}`);
      toast.success("সফলভাবে মুছে ফেলা হয়েছে");
      fetchDoner();
    } catch {
      toast.error("মুছে ফেলতে ব্যর্থ");
    }
  };

  // 🔹 Add / Update donor
  const handleSubmit = async () => {
    if (!newDonar.name || !newDonar.phone_number) {
      return toast.error("নাম এবং ফোন নাম্বার আবশ্যক");
    }

    try {
      if (newDonar.id) {
        await ApiManager.put(`/donar/${newDonar.id}`, newDonar, false);
        toast.success("দাতা তথ্য পরিবর্তন হয়েছে");
      } else {
        await ApiManager.post("/donar", newDonar, false);
        toast.success("নতুন দাতা যুক্ত হয়েছে");
      }

      setShowModal(false);
      setNewDonar(emptyDonar);
      fetchDoner();
    } catch {
      toast.error("সংরক্ষণ করা যায়নি");
    }
  };

  // 🔹 Table columns
  const columns = [
    { key: "doner_id", label: "দাতা নং" },
    { key: "name", label: "নাম" },
    { key: "phone_number", label: "ফোন নাম্বার" },
    { key: "amount", label: "পরিমান" },
    { key: "address", label: "ঠিকানা" },
    { key: "is_requring", label: "মাসিক/বাৎসরিক" },

  ];

  // 🔹 Table data
  const dataTable = donars.map((d) => ({
    ...d,
    is_requring: d.is_requring ? "মাসিক" : "বাৎসরিক",
    action: (
      <div className="space-x-2">
        <button className="btn btn-edit" onClick={() => handleEdit(d)}>
          <FaEdit />
        </button>
        <button className="btn btn-delete" onClick={() => handleDelete(d.id)}>
          <FaTrashAlt />
        </button>
      </div>
    ),
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1>দাতা ব্যবস্থাপনা</h1>

      <button
        className="btn btn-add"
        onClick={() => {
          setNewDonar(emptyDonar);
          setShowModal(true);
        }}
      >
        ➕ নতুন দাতা
      </button>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        <Table columns={columns} data={dataTable} />
      )}

      {/* 🔹 Modal */}
      {showModal && (
        <ModalBox
          title={newDonar.id ? "দাতা পরিবর্তন করুন" : "নতুন দাতা যুক্ত করুন"}
          onClose={() => {
            setShowModal(false);
            setNewDonar(emptyDonar);
          }}
        >
          <div className="modal-form-row">
            <label>দাতা নং</label>
            <input
              value={newDonar.doner_id}
              onChange={(e) =>
                setNewDonar({ ...newDonar, doner_id: e.target.value })
              }
            />
          </div>

          <div className="modal-form-row">
            <label>দাতার নাম</label>
            <input
              value={newDonar.name}
              onChange={(e) =>
                setNewDonar({ ...newDonar, name: e.target.value })
              }
            />
          </div>

          <div className="modal-form-row">
            <label>ফোন নাম্বার</label>
            <input
              value={newDonar.phone_number}
              onChange={(e) =>
                setNewDonar({ ...newDonar, phone_number: e.target.value })
              }
            />
          </div>

          <div className="modal-form-row">
            <label>টাকার পরিমান</label>
            <input
              type="number"
              value={newDonar.amount}
              onChange={(e) =>
                setNewDonar({ ...newDonar, amount: e.target.value })
              }
            />
          </div>

          <div className="modal-form-row">
            <label>ঠিকানা</label>
            <input
              value={newDonar.address}
              onChange={(e) =>
                setNewDonar({ ...newDonar, address: e.target.value })
              }
            />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={newDonar.is_requring}
              onChange={(e) =>
                setNewDonar({ ...newDonar, is_requring: e.target.checked })
              }
            />
            মাসিক হলে টিক দিন
          </label>

          <div className="modal-actions">
            <button className="btn btn-save" onClick={handleSubmit}>
              {newDonar.id ? "🔄 পরিবর্তন করুন" : "💸 যুক্ত করুন"}
            </button>
            <button
              className="btn btn-cancel"
              onClick={() => {
                setShowModal(false);
                setNewDonar(emptyDonar);
              }}
            >
              ❌ বাতিল
            </button>
          </div>
        </ModalBox>
      )}
    </main>
  );
}
