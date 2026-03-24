import React, { useEffect, useState } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [statement, setStatement] = useState([]);
  const [listpkgtype, setListpkgtype] = useState([]);
  const [user, setUser] = useState({});
  const [selectedPkgId, setSelectedPkgId] = useState("");
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [dueInvoices, setDueInvoices] = useState([]);
  const [showDueModal, setShowDueModal] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paying, setPaying] = useState(false);

  // Handle resize for responsive
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Float Number to Bangla String Formatter
  const formatMoney = (number) => {
    const num = parseFloat(number) || 0;
    return num.toLocaleString("bn-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const loadWallet = async () => {
    try {
      const res = await ApiManager.get("/wallet/dashboard");
      setBalance(res.balance || 0);
      setListpkgtype(res.pkgList || []);
      setUser(res.user || {});
      setStatement(res.statement || []);
    } catch {
      toast.error("ওয়ালেট তথ্য লোড করা যায়নি");
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const getPkgInfo = () =>
    listpkgtype.find((p) => p.id == user.pkg);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("bn-BD") : "নাই";

  const getRemainingDays = (expireDate) => {
    if (!expireDate) return 0;
    const today = new Date();
    const expire = new Date(expireDate);
    const diff = Math.ceil((expire - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const pkgInfo = getPkgInfo();
  const remainingDays = getRemainingDays(user.expire_date);
  const totalDays = pkgInfo?.days || 30;
  const progressPercent = Math.min(
    100,
    Math.round((remainingDays / totalDays) * 100)
  );
  const warningLevel =
    remainingDays <= 5 ? "danger" : remainingDays <= 10 ? "warning" : "success";

  const handleCreateRenewalInvoice = async () => {
    if (!selectedPkgId) {
      toast.error("প্যাকেজ নির্বাচন করুন");
      return;
    }
    try {
      setLoading(true);
      await ApiManager.post("/wallet/create-renewal-invoice", {
        pkgId: selectedPkgId,
      });
      toast.success("রিনিউ ইনভয়েস তৈরি হয়েছে");
      loadDueInvoices();
    } catch {
      toast.error("ইনভয়েস তৈরি ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  const loadDueInvoices = async () => {
    try {
      const res = await ApiManager.get("/wallet/due-invoices");
      setDueInvoices(res || []);
      setShowDueModal(true);
      setSelectedInvoices([]);
      setTotalAmount(0);
    } catch {
      toast.error("ডিউ ইনভয়েস লোড হয়নি");
    }
  };

  const toggleInvoice = (inv) => {
    let updated = [...selectedInvoices];
    if (updated.includes(inv.id)) {
      updated = updated.filter((id) => id !== inv.id);
      setTotalAmount((p) => p - Number(inv.amount));
    } else {
      updated.push(inv.id);
      setTotalAmount((p) => p + Number(inv.amount));
    }
    setSelectedInvoices(updated);
  };

  const paySelectedInvoices = async () => {
    if (balance < totalAmount) {
      toast.error("ব্যালেন্স পর্যাপ্ত নয়");
      return;
    }
    try {
      setPaying(true);
      await ApiManager.post("/wallet/pay-invoice", {
        invoice_ids: selectedInvoices,
      });
      toast.success("পেমেন্ট সফল");
      setShowDueModal(false);
      loadWallet();
    } catch {
      toast.error("পেমেন্ট ব্যর্থ");
    } finally {
      setPaying(false);
    }
  };

  const columns = [
    { key: "date", label: "তারিখ" },
    { key: "credit", label: "জমা" },
    { key: "debit", label: "খরচ" },
    { key: "reason", label: "বিবরণ" },
    { key: "status", label: "স্ট্যাটাস" },
  ];

  const data = statement.map((s) => ({
    date: new Date(s.date).toLocaleDateString("bn-BD"),
    credit: `${formatMoney(s.credit)} ৳`,
    debit: `${formatMoney(s.debit)} ৳`,
    reason: s.reason,
    status: s.status,
  }));

  const styles = {
    container: {
      padding: 20,
      background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "Segoe UI, sans-serif",
     // leave 300px on desktop
      transition: "margin-left 0.3s ease",
    },
    headerCard: {
      background: "linear-gradient(135deg, #1e3c72, #2a5298)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    },
    pkgName: { fontSize: 18, color: "#ffd369" },
    remainingText: { fontWeight: "bold", marginTop: 5 },
    progressWrapper: {
      background: "rgba(255,255,255,0.15)",
      height: 10,
      borderRadius: 10,
      overflow: "hidden",
      marginTop: 8,
    },
    progressBar: { height: "100%", transition: "width 0.4s ease" },
    alert: {
      background: "rgba(255,0,0,0.15)",
      borderLeft: "4px solid #ff4b2b",
      padding: 10,
      marginTop: 12,
      borderRadius: 8,
      fontSize: 14,
    },
    balanceCard: {
      background: "linear-gradient(135deg, #11998e, #38ef7d)",
      borderRadius: 16,
      padding: 25,
      marginBottom: 20,
      textAlign: "center",
      color: "#003333",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    },
    renewalSection: {
      background: "#1c1c2b",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    formControl: {
      width: "100%",
      padding: 10,
      borderRadius: 8,
      border: "none",
      marginBottom: 12,
    },
    btnPrimary: {
      padding: "10px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "#fff",
    },
    btnWarning: {
      padding: "10px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #f7971e, #ffd200)",
      color: "#000",
      marginBottom: 20,
    },
    walletStatement: {
      background: "#141421",
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
    },
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
    modal: {
      background: "#1f1f2e",
      padding: 25,
      borderRadius: 16,
      width: "90%",
      maxWidth: 420,
      boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
    },
  };

  return (
    <main className="main-container" style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div style={styles.headerCard}>
        <h2>💼 মাদরাসা ওয়ালেট</h2>
        <p style={styles.pkgName}>
          📦 প্যাকেজ: <strong>{pkgInfo?.name || "নির্ধারিত নেই"}</strong>
        </p>
        <p>
          👥 ছাত্র: {(user.total_students ?? 0).toLocaleString("bn-BD")}/
          {(user.limitOfStudent ?? 0).toLocaleString("bn-BD")}
        </p>
        <p>⏳ মেয়াদ শেষ: <strong>{formatDate(user.expire_date)}</strong></p>
        <p
          style={{
            ...styles.remainingText,
            color:
              warningLevel === "success"
                ? "#4cd137"
                : warningLevel === "warning"
                ? "#fbc531"
                : "#ff6b6b",
          }}
        >
          🕒 বাকি আছে: <strong>{remainingDays.toLocaleString("bn-BD")} দিন</strong>
        </p>
        <div style={styles.progressWrapper}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progressPercent}%`,
              background:
                warningLevel === "success"
                  ? "linear-gradient(90deg, #00b09b, #96c93d)"
                  : warningLevel === "warning"
                  ? "linear-gradient(90deg, #f7971e, #ffd200)"
                  : "linear-gradient(90deg, #ff416c, #ff4b2b)",
            }}
          />
        </div>
        {remainingDays <= 5 && <div style={styles.alert}>⚠️ প্যাকেজের মেয়াদ শেষের পথে, অনুগ্রহ করে রিনিউ করুন</div>}
      </div>

      {/* BALANCE */}
      <div style={styles.balanceCard}>
        <h4>💰 বর্তমান ব্যালেন্স</h4>
        <h1>{formatMoney(balance)} ৳</h1>
      </div>

      {/* RENEW */}
      <div style={styles.renewalSection}>
        <h3>🔄 প্যাকেজ রিনিউ / আপগ্রেড</h3>
        <select
          style={styles.formControl}
          value={selectedPkgId}
          onChange={(e) => setSelectedPkgId(e.target.value)}
        >
          <option value="">প্যাকেজ নির্বাচন করুন</option>
          {listpkgtype.map((pkg) => (
            <option
              key={pkg.id}
              value={pkg.id}
              disabled={user.total_students > pkg.studentlimit}
            >
              {pkg.name} — {formatMoney(pkg.price)}৳ | {pkg.studentlimit.toLocaleString("bn-BD")} জন | {pkg.days.toLocaleString("bn-BD")} দিন
            </option>
          ))}
        </select>
        <button style={styles.btnPrimary} disabled={!selectedPkgId || loading} onClick={handleCreateRenewalInvoice}>
          {loading ? "ইনভয়েস তৈরি হচ্ছে..." : "ইনভয়েস তৈরি করুন"}
        </button>
      </div>

      <button style={styles.btnWarning} onClick={loadDueInvoices}>
        📄 Due Invoices
      </button>

      {/* STATEMENT */}
      <div style={styles.walletStatement}>
        <h3>📊 লেনদেন বিবরণী</h3>
        {statement.length ? <Table columns={columns} data={data} /> : <p>লেনদেন নেই</p>}
      </div>

      {/* DUE MODAL */}
      {showDueModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>🧾 বকেয়া ইনভয়েস</h3>
            {dueInvoices.map((inv) => (
              <div key={inv.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: 8, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <input type="checkbox" checked={selectedInvoices.includes(inv.id)} onChange={() => toggleInvoice(inv)} />
                <span>{inv.reasons} — {formatMoney(inv.amount)}৳</span>
              </div>
            ))}
            <p>মোট: <strong>{formatMoney(totalAmount)} ৳</strong></p>
            <button style={{ ...styles.btnPrimary, marginTop: 10 }} disabled={paying || totalAmount === 0} onClick={paySelectedInvoices}>
              {paying ? "প্রসেসিং..." : "পেমেন্ট করুন"}
            </button>
            <button style={{ ...styles.btnPrimary, marginTop: 10, background: "#777" }} onClick={() => setShowDueModal(false)}>বন্ধ</button>
          </div>
        </div>
      )}
    </main>
  );
}
