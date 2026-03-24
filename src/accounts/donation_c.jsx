import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import ApiManager from "../apimanger";
import Buttons from "../components/buttons";

export default function DonationCollection() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [donationTypes, setDonationTypes] = useState([]);
  const [funds, setFunds] = useState([]);
  const [rosidBooks, setRosidBooks] = useState([]);
  const [rosidPages, setRosidPages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const bnMonths = [
    "জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
    "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"
  ];

  const emptyDonation = {
    id: null,
    boi_number: "",
    address: "",
    phone: "",
    roshid_number: "",
    donor_id: null,
    donor_name: "",
    amount: "",
    donation_type: "",
    fund: "",
    is_monthly: false,
    month: "",
    donation_date: "",
    collector: null,
    remarks: "",
    method: "cash",
  };

  const [currentDonation, setCurrentDonation] = useState(emptyDonation);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Bangla number converter
  const toBanglaNumber = (num) => {
    const bnNums = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bnNums[d] ?? d).join("");
  };

  const formatDateToDDMMYYYY = (dateStr) => {
    if(!dateStr) return "";
    const d = new Date(dateStr);
    const day = toBanglaNumber(d.getDate().toString().padStart(2, "0"));
    const month = toBanglaNumber((d.getMonth() + 1).toString().padStart(2, "0"));
    const year = toBanglaNumber(d.getFullYear());
    return `${day}/${month}/${year}`;
  };
const handlePrintRosid = (data) => {
  const win = window.open("", "", "width=850,height=600");

  win.document.write(`
    <html>
    <head>
      <title>রশিদ</title>
      <style>
        body {
          margin: 0;
          font-family: SolaimanLipi, Arial;
        }

        .page {
          width: 800px;
          height: 520px;
          margin: auto;
          background: url("/Rosid-book-01.jpg") no-repeat center;
          background-size: 100% 100%;
          position: relative;
        }

        .field {
          position: absolute;
          font-size: 14px;
          color: #000;
          white-space: nowrap;
        }
      </style>
    </head>

    <body onload="window.print(); window.close();">
      <div class="page">

        <!-- 🧾 রশিদ নং -->
        <div class="field" style="top: 40px; right: 80px;">
          ${data.roshid_number}
        </div>

        <!-- 📅 তারিখ -->
        <div class="field" style="top: 65px; right: 80px;">
          ${data.date}
        </div>

        <!-- 👤 নাম -->
        <div class="field" style="top: 130px; left: 120px;">
          ${data.name}
        </div>

        <!-- 🏠 ঠিকানা -->
        <div class="field" style="top: 160px; left: 120px;">
          ${data.address || ""}
        </div>

        <!-- 💰 টাকার পরিমাণ -->
        <div class="field" style="top: 200px; left: 120px;">
          ${data.amount} টাকা
        </div>

        <!-- 📝 ফি / দান বিবরণ -->
        <div class="field" style="top: 235px; left: 120px;">
          ${data.description}
        </div>

        <!-- ✍️ আদায়কারী -->
        <div class="field" style="bottom: 70px; right: 100px;">
          ${data.collector}
        </div>

      </div>
    </body>
    </html>
  `);

  win.document.close();
};

  // Fetch initial data
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [donationData, donorData, donationTypeData, fundData, rosidData] = await Promise.all([
        ApiManager.get("/donation-collection"),
        ApiManager.get("/donar"),
        ApiManager.get("/donation-type"),
        ApiManager.get("/accounting/funds"),
        ApiManager.get("/receipt-book/roshid/list")
      ]);
      setDonations(donationData);
      setDonors(donorData);
      setDonationTypes(donationTypeData);
      setFunds(fundData);
      setRosidBooks(rosidData);
    } catch (err) {
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Donor suggestions
  const filteredDonors = donors.filter(d =>
    d.name.toLowerCase().includes(currentDonation.donor_name.toLowerCase())
  );

  const handleDonorNameChange = (e) => {
    setCurrentDonation({ ...currentDonation, donor_name: e.target.value, donor_id: null });
    setDropdownVisible(true);
    setActiveIndex(0);
  };

  const handleSelectDonor = (donor) => {
    setCurrentDonation({
      ...currentDonation,
      donor_id: donor.id,
      donor_name: donor.name,
      amount: donor.amount || "",
      is_monthly: donor.is_requring === 1,
    });
    setDropdownVisible(false);
    setActiveIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!dropdownVisible || filteredDonors.length === 0) return;
    if (e.key === "ArrowDown") e.preventDefault() && setActiveIndex(prev => (prev < filteredDonors.length -1 ? prev +1 : prev));
    else if (e.key === "ArrowUp") e.preventDefault() && setActiveIndex(prev => (prev>0?prev-1:0));
    else if (e.key === "Enter") e.preventDefault() && handleSelectDonor(filteredDonors[activeIndex]);
    else if (e.key === "Escape") setDropdownVisible(false);
  };

  // Select rosid book to get next page
  const handleRosidBookChange = async (bookId) => {
    setCurrentDonation({ ...currentDonation, boi_number: bookId, roshid_number: "" });
    if (!bookId) return setRosidPages([]);
    try {
      const res = await ApiManager.get(`/receipt-book/roshid/next/${bookId}`);
      setRosidPages(res.next_receipt ? [res.next_receipt] : []);
      if (res.next_receipt) setCurrentDonation(prev => ({ ...prev, roshid_number: res.next_receipt }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!currentDonation.boi_number) return toast.error("রশিদ বই নির্বাচন করুন!");
    if (!currentDonation.roshid_number) return toast.error("পৃষ্ঠা নির্বাচন করুন!");
    if (!currentDonation.donor_name) return toast.error("দাতার নাম প্রয়োজন!");
    if (!currentDonation.amount) return toast.error("পরিমাণ লিখুন!");
    if (!currentDonation.donation_type) return toast.error("দান ধরন নির্বাচন করুন!");
    if (!currentDonation.fund) return toast.error("ফান্ড নির্বাচন করুন!");

    setSaving(true);
    try {
      const payload = {
        ...currentDonation,
        boi_number: currentDonation.boi_number,
        roshid_number: currentDonation.roshid_number,
      };

      if (currentDonation.id == null) {
        await ApiManager.post("/donation-collection", payload);
        toast.success("দান সফলভাবে যোগ হয়েছে!");
      } else {
        await ApiManager.put(`/donation-collection/${currentDonation.id}`, payload);
        toast.success("দান সফলভাবে পরিবর্তন হয়েছে!");
      }
      setShowModal(false);
      setCurrentDonation(emptyDonation);
      fetchAll();
    } catch (err) {
      toast.error("সংরক্ষণ করতে সমস্যা হয়েছে!");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1>দান সংগ্রহ ম্যানেজমেন্ট</h1>
      <button className="btn btn-add" onClick={() => { setCurrentDonation(emptyDonation); setShowModal(true); }}>
        নতুন দান যোগ করুন
      </button>

      {loading ? <p>লোড হচ্ছে...</p> : (
        <Table
          columns={[
            { key: "boi_number", label: "রশিদ বই" },
            { key: "roshid_number", label: "পৃষ্ঠা" },
            { key: "donor_name", label: "দাতার নাম" },
            { key: "amount", label: "পরিমাণ" },
            { key: "donation_type", label: "দান ধরন" },
            { key: "funder_name", label: "ফান্ড" },
            { key: "is_monthly", label: "মাসিক/বাৎসরিক" },
            { key: "month", label: "মাস" },
            { key: "donation_date", label: "তারিখ" },
           
          ]}
          data={donations.map(d => ({
            ...d,
            key: d.id,
            boi_number: toBanglaNumber(d.boi_number||0),
            roshid_number: toBanglaNumber(d.roshid_number||0),
            donation_type: donationTypes.find(dt => dt.id === d.donation_type)?.name || "-",
            fund: d.fund,
            amount: toBanglaNumber(d.amount || 0),
            is_monthly: d.is_monthly ? "মাসিক" : "বাৎসরিক",
            month: d.month ? bnMonths[d.month - 1] : "-",
            donation_date: formatDateToDDMMYYYY(d.donation_date),
            action: (
              <div className="space-x-2">
                <Buttons type="edit" onClick={() => { setCurrentDonation(d); setShowModal(true); }} />
                 <Buttons type="delete" onClick={async () => { await ApiManager.delete(`/donation-collection/${d.id}`); fetchAll(); }} />
               
                     <Buttons
  type="print"
  onClick={() =>
    handlePrintRosid({
      roshid_number: toBanglaNumber(d.roshid_number),
      date: formatDateToDDMMYYYY(d.donation_date),
      name: d.donor_name,
      address: d.address,
      amount: toBanglaNumber(d.amount),
      description:
        donationTypes.find(dt => dt.id === d.donation_type)?.name || "দান",
      collector: d.collector_name || "ক্যাশ",
    })
  }
/>

              </div>
            ),
          }))}
        />
      )}

      {showModal && (
        <ModalBox title={saving ? "সংরক্ষণ হচ্ছে..." : currentDonation.id ? "দান পরিবর্তন" : "নতুন দান"} onClose={() => setShowModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="modal-form-row">
              <label>রশিদ বই নির্বাচন করুন</label>
              <select value={currentDonation.boi_number} onChange={e => handleRosidBookChange(e.target.value)}>
                <option value="">-- নির্বাচন করুন --</option>
                {rosidBooks.map(b => <option key={b.boi_number} value={b.boi_number}>{b.name} ({b.boi_number})</option>)}
              </select>
            </div>

            {rosidPages.length > 0 && (
              <div className="modal-form-row">
                <label>পৃষ্ঠা নির্বাচন করুন</label>
                <select value={currentDonation.roshid_number} onChange={e => setCurrentDonation({ ...currentDonation, roshid_number: e.target.value })}>
                  {rosidPages.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}

            <div className="modal-form-row">
              <label>দাতার নাম</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={currentDonation.donor_name}
                  onChange={handleDonorNameChange}
                  onKeyDown={handleKeyDown}
                  placeholder="নাম টাইপ করুন বা নির্বাচন করুন"
                  autoComplete="off"
                />
                {dropdownVisible && filteredDonors.length > 0 && (
                  <ul className="dropdown-suggestions">
                    {filteredDonors.map((d, i) => (
                      <li key={d.id} className={i === activeIndex ? "active-suggestion" : ""} onClick={() => handleSelectDonor(d)}>
                        {d.name} — {d.amount || " "} টাকা
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

               
            <div className="modal-form-row">
              <label>ঠিকানা</label>
              <input type="text" value={currentDonation.address} onChange={(e) => setCurrentDonation({ ...currentDonation, address: e.target.value })} />
            </div>

            <div className="modal-form-row">
              <label>ফোন</label>
              <input type="text" value={currentDonation.phone} onChange={(e) => setCurrentDonation({ ...currentDonation, phone: e.target.value })} />
            </div>

            <div className="modal-form-row">
              <label>দান ধরন</label>
              <select value={currentDonation.donation_type} onChange={(e) => setCurrentDonation({ ...currentDonation, donation_type: e.target.value })}>
                <option value="">ধরন নির্বাচন করুন</option>
                {donationTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="modal-form-row">
              <label>ফান্ড</label>
              <select value={currentDonation.fund} onChange={(e) => setCurrentDonation({ ...currentDonation, fund: e.target.value })}>
                <option value="">ফান্ড নির্বাচন করুন</option>
                {funds.map(f => <option key={f.id} value={f.id}>{f.funder_name}</option>)}
              </select>
            </div>

            <div className="modal-form-row">
              <label>টাকার পরিমাণ</label>
              <input type="number" value={currentDonation.amount} onChange={(e) => setCurrentDonation({ ...currentDonation, amount: e.target.value })} />
            </div>

            <div className="modal-form-row">
              <label>মাসিক হলে টিক দিন</label>
              <input type="checkbox" checked={currentDonation.is_monthly} onChange={(e) => setCurrentDonation({ ...currentDonation, is_monthly: e.target.checked })} />
            </div>

            {currentDonation.is_monthly && (
              <div className="modal-form-row">
                <label>মাস নির্বাচন করুন</label>
                <select value={currentDonation.month} onChange={(e) => setCurrentDonation({ ...currentDonation, month: e.target.value })}>
                  <option value="">মাস নির্বাচন করুন</option>
                  {bnMonths.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
            )}

            <div className="modal-form-row">
              <label>মন্তব্য</label>
              <input type="text" value={currentDonation.remarks} onChange={(e) => setCurrentDonation({ ...currentDonation, remarks: e.target.value })} />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-cancel" onClick={() => setShowModal(false)}>❌ বাতিল</button>
              <button type="submit" className="btn btn-save" disabled={saving}>
                {saving ? (currentDonation.id ? "আপডেট হচ্ছে..." : "সংরক্ষণ হচ্ছে...") : "💾 সংরক্ষণ"}
              </button>
            </div>
          </form>
        </ModalBox>
      )}
    </main>
  );
}
