import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import HomeworkPDF from "../pdf/homework";

export default function Homework() {
  const [homeworks, setHomeworks] = useState([]);
  const [filterJamat, setFilterJamat] = useState("");
  const [filterSheet, setFilterSheet] = useState("");
  const [showTable, setShowTable] = useState(false);

  const [jamats, setJamats] = useState([]);
  const [sheetnumbers, setSheetnumbers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [header, setHeader] = useState({
    institute_name_bn: "",
    logo: "",
    address: "",
    phone: "",
    email: "",
    jamat_name: "",
    sheet_number: "",
    date: ""
  });

  useEffect(() => {
    fetchHomeworks();
  }, []);

function dateformat(date) {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d)) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}


  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/homework");
      const jamat = await ApiManager.get("/jamat");
      const sheetnumber = await ApiManager.get("/sheetnumber");
      const sitesetting = await ApiManager.get("/sitesetting");

      setHeader((prev) => ({
        ...prev,
        institute_name_bn: sitesetting.institute_name_bn || "",
        logo: sitesetting.logo || "",
        address: sitesetting.address || "",
        phone: sitesetting.phone || "",
        email: sitesetting.email || ""
      }));

      setHomeworks(data);
      setJamats(jamat);
      setSheetnumbers(sheetnumber);

    } catch (err) {
      toast.error("বাড়ির কাজ লোড করতে সমস্যা হয়েছে!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // FILTER LOGIC
  const filteredHomeworks = homeworks.filter((hw) => {
    const matchJamat = filterJamat ? hw.jamat_id == filterJamat : true;
    const matchSheet = filterSheet ? hw.sheet_number_id == filterSheet : true;
    return matchJamat && matchSheet;
  });

  const homeworkdata = async () => {
    if (!filterJamat || !filterSheet) {
      toast.error("শ্রেণি এবং শীট নাম্বার নির্বাচন করুন!");
      return;
    }

    try {
      const data = await ApiManager.get(
        `/homework/class/${filterJamat}/sheetnumber/${filterSheet}`
      );
      setHomeworks(data);
      setShowTable(true);
    } catch (err) {
      toast.error("বাড়ির কাজ লোড করতে সমস্যা হয়েছে!");
      console.error(err);
    }
  };

  return (
    <main className="main-container">
      <ToastContainer />

      <div
        className="page-header"
        style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
      >

        {/* JAMAT SELECT */}
        <select
          value={filterJamat}
          onChange={(e) => {
            const value = e.target.value;
            setFilterJamat(value);

            const selected = jamats.find((j) => j.id == value);

            setHeader((prev) => ({
              ...prev,
              jamat_name: selected?.name || ""
            }));
          }}
        >
          <option value="">শ্রেণি নির্বাচন করুন</option>
          {jamats.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>

        {/* SHEET NUMBER SELECT */}
        <select
          value={filterSheet}
          onChange={(e) => {
            const value = e.target.value;
            setFilterSheet(value);

            const selected = sheetnumbers.find((s) => s.id == value);

            setHeader((prev) => ({
              ...prev,
              date: dateformat(selected?.date) || "",
              sheet_number: selected?.sheet_number || ""
            }));
        
          }}
        >
          <option value="">শীট নাম্বার নির্বাচন করুন</option>
          {sheetnumbers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.sheet_number}- {s.date ? dateformat(s.date) : "No Date"}
            </option>
          ))}
        </select>

        <button className="btn btn-view-details" onClick={homeworkdata}>
          ফিল্টার করুন
        </button>
      </div>

      <h1 className="page-title">বাড়ির কাজ ডাউনলোড</h1>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        
        <>
     
          

          {showTable && homeworks.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <PDFViewer style={{ width: "100%", height: "600px" }}>
                <HomeworkPDF homeworks={homeworks} header={header} />
              </PDFViewer>
              <br />
              <PDFDownloadLink
              className="btn btn-approve"
                document={
                  <HomeworkPDF homeworks={homeworks} header={header} />
                }
                fileName={`homework_${header.jamat_name || "class"}_${header.sheet_number || "sheet"}.pdf`}
              >
                {({ loading }) =>
                  loading ? "ডাউনলোড লিংক তৈরি হচ্ছে..." : "PDF ডাউনলোড করুন"
                }
              </PDFDownloadLink>

            </div>
          )}
        </>
      )}
    </main>
  );
}
