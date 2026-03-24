import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  PDFDownloadLink,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";

// 🏫 Base URL
const BASE_URL = import.meta.env.VITE_API_URL || "";

// 🔢 Bangla digit converter
const toBanglaDigit = (num) => {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num ? num.toString().replace(/\d/g, (d) => bn[d]) : "";
};

// 🖋️ Register Bangla Font
Font.register({
  family: "SolaimanLipi",
  src: `${window.location.origin}/fonts/SolaimanLipi.ttf`,
});

// 🧱 Card Size
const CARD_WIDTH = 243;
const CARD_HEIGHT = 360;

// 🎨 Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "SolaimanLipi",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    padding: 10,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 8,
    borderRadius: 10,
    overflow: "hidden",
    border: "1pt solid #ccc",
    position: "relative",
    backgroundColor: "#fff",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  watermark: {
    position: "absolute",
    top: "35%",
    left: "25%",
   
    opacity: 0.08,
  },
headerContainer: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 10,
  height: 70,
},

instituteLogo: {
  width: 50,
  height: 50,
  marginRight: 10,
},
instituteName: {
  fontSize: 18,
  fontWeight: "bold",
  textAlign: "center",
  color: "#fff", // ⭐ best choice
  flex: 1,
},


 
  photo: {
    width: 70,
    height: 80,
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 5,
    border: "1pt solid #000",
  },
fieldContainer: {
  paddingHorizontal: 10,
  alignSelf: "center",
},

  field: {
    fontSize: 14,
    marginBottom: 2,
  },
  qr: {
    width: 40,
    height: 40,
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});

// 🔹 Proxy helper
const proxyImage = (url) => `${BASE_URL}/proxy/${encodeURIComponent(url)}`;

// 📘 ID Card PDF Template
const IDCardPDF = ({ students, logo, background, watermark, institute_name_bn }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {students.map((s) =>
        s && s.id ? (
          <View key={s.id} style={styles.cardContainer}>
            {background && <Image src={background} style={styles.backgroundImage} />}
            {watermark && <Image src={watermark} style={styles.watermark} />}

          <View style={styles.headerContainer}>
  {logo && <Image src={logo} style={styles.instituteLogo} />}
  <Text style={styles.instituteName}>{institute_name_bn}</Text>
</View>


            <Image src={s.photo || proxyImage("/img/default-photo.jpg")} style={styles.photo} />

            <View style={styles.fieldContainer}>
              <Text style={{fontFamily: "SolaimanLipi", fontSize: 18,textAlign:"center"}}> { s.name || ""}</Text>
              <Text style={styles.field}>পিতার নাম: {s.fatherName || ""}</Text>
              <Text style={styles.field}>শ্রেণি: {s.jamat_name || ""}</Text>
              <Text style={styles.field}>সেশন: {toBanglaDigit(s.session_name) || ""}</Text>
              <Text style={styles.field}>আইডি: {toBanglaDigit(s.id) || ""}</Text>
              <Text style={styles.field}>রোল: {toBanglaDigit(s.roll) || ""}</Text>
            </View>

            {s.qr && <Image src={s.qr} style={styles.qr} />}
          </View>
        ) : null
      )}
    </Page>
  </Document>
);

export default function IdCard() {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [jamats, setJamats] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filterJamat, setFilterJamat] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [searchId, setSearchId] = useState("");

  const [institute_name_bn, setInstitute_name_bn] = useState("");
  const [logo, setLogo] = useState(null);
  const [background, setBackground] = useState(null);
  const [watermark, setWatermark] = useState(null);

  useEffect(() => {
    fetchFilters();
    fetchStudents();

    const urlParams = new URLSearchParams(window.location.search);
    const jamat = urlParams.get("jamat");
    const session = urlParams.get("session");
    const student_id = urlParams.get("student_id");

    if (jamat) setFilterJamat(jamat);
    if (session) setFilterSession(session);
    if (student_id) setSearchId(student_id);
  }, []);

  const fetchFilters = async () => {
    try {
      const jamatData = await ApiManager.get("/jamat");
      const sessionData = await ApiManager.get("/session");
      setJamats(jamatData);
      setSessions(sessionData);
    } catch {
      toast.error("ফিল্টার ডেটা লোড করতে সমস্যা হয়েছে!");
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await ApiManager.get("/student");
      const siteSetting = await ApiManager.get("/sitesetting");

      setInstitute_name_bn(siteSetting?.institute_name_bn || "Plazma Admission Coaching");

      const logoBase64 = siteSetting?.logo ? proxyImage(`${BASE_URL}/uploads/${siteSetting.logo}`) : null;
      const backgroundBase64 = siteSetting?.idcard ? proxyImage(`${BASE_URL}/uploads/${siteSetting.idcard}`) : null;
      const watermarkBase64 = siteSetting?.watermark ? proxyImage(`${BASE_URL}/uploads/${siteSetting.watermark}`) : null;

      setLogo(logoBase64);
      setBackground(backgroundBase64);
      setWatermark(watermarkBase64);

      const processed = data.map((s) => {
        const photo = s.photo ? proxyImage(`${BASE_URL}/${s.photo}`) : proxyImage("/img/default-photo.jpg");
        const qr = proxyImage(`https://api.qrserver.com/v1/create-qr-code/?data=${s.id}&size=100x100`);

        return { ...s, photo, qr };
      });

      const urlParams = new URLSearchParams(window.location.search);
      const jamat = urlParams.get("jamat");
      const session = urlParams.get("session");
      const student_id = urlParams.get("student_id");

      const filtered = processed.filter((s) => {
        return (
          (!jamat || s.jamat?.toString() === jamat) &&
          (!session || s.session?.toString() === session) &&
          (!student_id || s.id?.toString() === student_id)
        );
      });

      setFilteredStudents(filtered);
    } catch (err) {
      console.error(err);
      toast.error("ছাত্রের তথ্য আনতে সমস্যা হয়েছে!");
    }
  };

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="student-management">
        <h1>ছাত্র আইডি কার্ড তৈরি করুন</h1>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <select value={filterJamat} onChange={(e) => setFilterJamat(e.target.value)}>
            <option value="">সব শ্রেণি</option>
            {jamats.map((j) => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>

          <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
            <option value="">সব সেশন</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="আইডি দিয়ে অনুসন্ধান করুন"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />

          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (filterJamat) params.append("jamat", filterJamat);
              if (filterSession) params.append("session", filterSession);
              if (searchId) params.append("student_id", searchId);

              window.location.href = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
            }}
            className="btn btn-add"
          >
            অনুসন্ধান
          </button>
        </div>

        {filteredStudents.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <PDFViewer width="100%" height="600">
              <IDCardPDF
                students={filteredStudents}
                logo={logo}
                background={background}
                watermark={watermark}
                institute_name_bn={institute_name_bn}
              />
            </PDFViewer>

            <PDFDownloadLink
              document={
                <IDCardPDF
                  students={filteredStudents}
                  logo={logo}
                  background={background}
                  watermark={watermark}
                  institute_name_bn={institute_name_bn}
                />
              }
              fileName="student-id-cards.pdf"
            >
              {({ loading }) => (
                <button className="btn btn-save">
                  {loading ? "পিডিএফ প্রস্তুত হচ্ছে..." : "পিডিএফ ডাউনলোড করুন"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}
      </div>
    </main>
  );
}
