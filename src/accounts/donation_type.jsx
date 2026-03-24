import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";

export default function DonationType() {
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [funds, setFunds] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const emptyDonation = { id: null, name: "", fund_type: null };
  const [newDonation, setNewDonation] = useState(emptyDonation);

  useEffect(() => {
    fetchDonationTypes();
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      const data = await ApiManager.get("/accounting/funds");
      setFunds(data || []);
    } catch {
      toast.error("ফান্ড লোড করতে সমস্যা হয়েছে");
    }
  };

  const fetchDonationTypes = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/donation-type");
      setDonations(data || []);
    } catch {
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDonation({ ...newDonation, [name]: value });
  };

  const handleSave = async () => {
    if (!newDonation.name || newDonation.fund_type === "0") {
      toast.warn("সব ঘর পূরণ করুন!");
      return;
    }
    try {
      if (newDonation.id) {
        await ApiManager.put(`/donation-type/${newDonation.id}`, newDonation);
        toast.success("সফলভাবে আপডেট হয়েছে!");
      } else {
        await ApiManager.post("/donation-type", newDonation);
        toast.success("সফলভাবে যুক্ত হয়েছে!");
      }
      setShowModal(false);
      setNewDonation(emptyDonation);
      fetchDonationTypes();
    } catch {
      toast.error("সংরক্ষণ করতে সমস্যা হয়েছে!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?")) return;
    try {
      await ApiManager.delete(`/donation-type/${id}`);
      toast.success("মুছে ফেলা হয়েছে!");
      fetchDonationTypes();
    } catch {
      toast.error("মুছে ফেলতে সমস্যা হয়েছে!");
    }
  };

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">দান টাইপ ব্যবস্থাপনা</h2>
        <button
          className="btn btn-add"
          onClick={() => {
            setNewDonation(emptyDonation);
            setShowModal(true);
          }}
        >
          নতুন যুক্ত করুন
        </button>
      </div>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        <Table
          columns={[
            { key: "name", label: "নাম" },
            { key: "fund_type", label: "ফান্ড টাইপ" },
          
          ]}
          data={donations.map((d) => ({
            ...d,
            fund_type:
              funds.find((f) => f.id === d.fund_type)?.funder_name || "",
            action: (
              <div className="space-x-2">
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setNewDonation(d);
                    setShowModal(true);
                  }}
                >
                  ✏️ সম্পাদনা
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(d.id)}
                >
                  🗑️ মুছুন
                </button>
              </div>
            ),
          }))}
        />
      )}

      {showModal && (
        <ModalBox
          title={newDonation.id ? "দান টাইপ পরিবর্তন করুন" : "নতুন দান টাইপ"}
          onClose={() => setShowModal(false)}
          
        >
          
            <div className="modal-form-row">
              <label>নাম:</label>
              <input
                type="text"
                name="name"
                value={newDonation.name}
                onChange={handleChange}
                className="input-field"
                placeholder="দান টাইপের নাম লিখুন"
              />
            </div>

            <div className="modal-form-row">
              <label>ফান্ড টাইপ:</label>
              <select
                name="fund_type"
                value={newDonation.fund_type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="0">নির্বাচন করুন</option>
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.funder_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-delete"
                onClick={() => setShowModal(false)}
              >
                বাতিল
              </button>
              <button className="btn btn-add" onClick={handleSave}>
                {newDonation.id ? "🔄 পরিবর্তন করুন" : "💸 সংরক্ষণ করুন"}
              </button>
            </div>
        
        </ModalBox>
      )}
    </main>
  );
}
