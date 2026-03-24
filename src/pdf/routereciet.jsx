import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiManager from "../apimanger";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import ReceiptPDF from "./reciet";

export default function DownloadReceiptPDF() {
  const { boinumber, roshidnumber } = useParams();
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        if (boinumber && roshidnumber) {
          const res = await ApiManager.get(
            `/accounting/payments/check/${boinumber}/${roshidnumber}`
          );
          setReceiptData(res);
        }
      } catch (err) {
        console.error("Failed to fetch receipt:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [boinumber, roshidnumber]);

  if (loading) return <p>⏳ লোড হচ্ছে...</p>;
  if (!receiptData) return <p>❌ কোনো ডাটা পাওয়া যায়নি</p>;

  const formNumber = `${boinumber}-${roshidnumber}`;

  return (
    <main className="main-container" style={{ textAlign: "center", margin: "20px" }}>
      <div style={{ border: "1px solid #ccc", marginBottom: "20px" }}>
        <PDFViewer style={{ width: "100%", height: "600px" }}>
          <ReceiptPDF data={receiptData}   boinumber={boinumber} roshidnumber={roshidnumber} payment_date={receiptData?.payment_date || null} />
        </PDFViewer>
      </div>

      <PDFDownloadLink
        document={<ReceiptPDF data={receiptData}  boinumber={boinumber} roshidnumber={roshidnumber} payment_date={receiptData?.payment_date || null} />}
        fileName={`receipt_${formNumber}.pdf`}
        style={{
          backgroundColor: "#6730cc",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "5px",
          textDecoration: "none",
        }}
      >
        {({ loading }) => (loading ? "PDF তৈরি হচ্ছে..." : "PDF ডাউনলোড")}
      </PDFDownloadLink>
    </main>
  );
}
