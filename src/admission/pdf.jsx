import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiManager from "../apimanger";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  PDFDownloadLink,
  PDFViewer,
  Font,
} from "@react-pdf/renderer";

// Register Bangla font
Font.register({
  family: "SolaimanLipi",
  src: `/fonts/SolaimanLipi.ttf`,
  fontStyle: "normal",
  fontWeight: "normal",
});

const BASE_URL = import.meta.env.VITE_API_URL;
const proxyImage = (url) => `${BASE_URL}/proxy/${encodeURIComponent(url)}`;
const enToBnNumber = (number) => {
  if (number === null || number === undefined) return "";
  const en = ["0","1","2","3","4","5","6","7","8","9"];
  const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  return number.toString().split("").map(c => en.includes(c) ? bn[en.indexOf(c)] : c).join("");
};
const styles = StyleSheet.create({
  page: {
    fontFamily: "SolaimanLipi",
    fontSize: 14,
    padding: 20,
    width: "210mm",
    height: "297mm",
  },
  headerImg: { width: "100%", height: 150, marginBottom: 10,borderBottom:1,borderBottomColor:"black",

   },
  headerSection: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#250958",
    borderBottomStyle: "solid",
    paddingBottom: 5,
    marginBottom: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#250958",
    fontSize: 18,
    fontWeight: "bold",
  },
  studentPhoto: {
    width: 100,
    height: 120,
    objectFit: "cover",
    borderWidth: 2,
    
    borderColor: "#4808afff",
  },
  table: { display: "table", width: "auto", marginTop: 5 },
  tableRow: { flexDirection: "row" },
  tableColLabel: { width: "25%", marginLeft: 10, padding: 2, fontWeight: "bold" },
tableColValue: {
  width: "25%",
  borderBottomWidth: 1,
  borderBottomColor: "#000",
  borderStyle: "dashed", // ✅ add this
  padding: 2,
},
  signatureBoxContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  signatureBox: { width: "23%", textAlign: "center" },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#000", marginTop: 50 },


 table1: {
 
  margin: 10,
  marginTop: 30,
},

tableRow1: {
  flexDirection: "row",
  borderWidth: 1,
  borderColor: "#000",
  borderStyle: "solid",
}
,

  headerRow: {
    backgroundColor: "#f8f1f10a",
  },
  tableColHeader: {
    flex: 1,
    padding: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
 tableCol: {
  flex: 1,
  padding: 8,
  textAlign: "center",
  borderRightWidth: 1,
  borderRightColor: "#000",
  borderStyle: "solid",
},
addressBox: {
  width: "85%",
  borderBottomWidth: 1,
  borderStyle: "dashed",
  padding: 3,
  flexWrap: "wrap",
}

});

// PDF Document Component
function AdmissionPDF({ student, formNumber,bivag ,jamats}) {
  const jamatId = Number(student?.jamat);

  const jamatObj = jamats?.find(
  j => Number(j.id) === jamatId
);


 const bivagObj = bivag?.find(
  b => Number(b.id) === Number(jamatObj?.division)
);
const jamatName = jamatObj?.name || "";
const divisionName = bivagObj?.name || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {student?.header_image && (
          <Image
            style={styles.headerImg}
            src={proxyImage(`${BASE_URL}/uploads/${student.header_image.replace(/\\/g, "/")}`)}
          />
        )}

      <View style={{ flexDirection: "row", marginBottom: 20 }}>
  {/* Left Section */}
  <View style={{ width: "80%", paddingRight: 10 }}>
    
    <View style={{ flexDirection: "row" ,width:"100%"}}>

    <View style={{ marginBottom: 10 ,width:"55%"}}>
      <Text>ফর্ম নং: ক খ {enToBnNumber(formNumber) || ""}</Text>
      <Text>
        ভর্তির তারিখ: {student.admissionDate ? enToBnNumber(student.admissionDate) :"___/___/________"}
      </Text>
    </View>
<View>   
  <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
      ভর্তি ফর্ম
    </Text></View> </View>


    {/* Application Text */}
    <Text style={{ marginBottom: 5 }}>আস্সালামু আ'লাইকুম ওয়ারহমাতুল্লাহ!</Text>
    <Text style={{ marginBottom: 5 }}>মাননীয় মুহ্তামিম সাহেব,</Text>
    <Text >
      বিনীত নিবেদন এই যে আমি {student.name} যাবতীয় বিধি-বিধান ও নিয়মাবলি এবং
      ভবিষ্যতে গৃহীত আইন-কানুন মেনে চলার অঙ্গীকারবদ্ধ হয়ে অত্র মাদ্রাসায় ভর্তি
      হওয়ার আবেদন করছি। মেহেরবানী করে আমাকে সুযোগ দেওয়ার অনুরোধ জানাচ্ছি।
    </Text>
  </View>

  {/* Right Section (Student Photo) */}
  <View style={{ width: "100", marginLeft:"5px",alignItems: "flex-end" }}>
    <Image
      style={styles.studentPhoto}
      src={
        student.photo
          ? proxyImage(`${BASE_URL}/${student.photo.replace(/\\/g, "/")}`)
          : `${BASE_URL}/uploads/avata.jpg`
      }
      alt={
        student.photo
          ? `${BASE_URL}/${student.photo.replace(/\\/g, "/")}`
          : `${BASE_URL}/uploads/avata.jpg`
      }
    />
  </View>
</View>


        {/* Student Details Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}> নাম: </Text>
            <Text style={styles.tableColValue}> {student?.name || ""} </Text>
            <Text style={styles.tableColLabel}> জন্ম তারিখ: </Text>
            <Text style={styles.tableColValue}> 
              {student.dob ? enToBnNumber(student.dob) : ""} 
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}> পিতার নাম: </Text>
            <Text style={styles.tableColValue}>
              {student?.fatherName || ""}
              </Text>
            <Text style={styles.tableColLabel}> মাতার নাম: </Text>
            <Text style={styles.tableColValue}>
              {student?.motherName || ""}
              </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}> রোল: </Text>
            <Text style={styles.tableColValue}>{enToBnNumber(student?.roll) || ""}</Text>
            <Text style={styles.tableColLabel}> ফোন: </Text>
            <Text style={styles.tableColValue}>{enToBnNumber(student?.phone) || ""}</Text>
          </View>

    <View style={styles.tableRow}>
  <Text style={styles.tableColLabel}> ঠিকানা: </Text>

  <View style={{...styles.addressBox,
    width: "75%",
  }}>
    <Text>
       {student.union_name }, {student.sub_district_name }, {student.district_name } 
    </Text>
  </View>
</View>


        <View style={styles.tableRow}>
  <Text style={styles.tableColLabel}> জামাত: </Text>
  <Text style={styles.tableColValue}>
    {jamatName}
  </Text>

  <Text style={styles.tableColLabel}> বিভাগ: </Text>
  <Text style={styles.tableColValue}>
    {divisionName}
  </Text>
</View>

          <View style={styles.tableRow}>
              <Text style={styles.tableColLabel}> শিক্ষাবর্ষ: </Text>
           <Text style={styles.tableColValue}>{enToBnNumber(student?.session_name) || ""}</Text>
          
          <Text style={styles.tableColLabel}> ভর্তির তারিখ: </Text>
            <Text style={styles.tableColValue}>
              {student.admissionDate ? enToBnNumber(student.admissionDate)  : ""}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}> অভিভাবকের নাম: </Text>
            <Text style={styles.tableColValue}>{student?.gurdiant_name || ""}</Text>
            <Text style={styles.tableColLabel}> সম্পর্ক: </Text>
            <Text style={styles.tableColValue}>{student?.gurdiant_relation || ""}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}> অভিভাবকের ফোন: </Text>
            <Text style={styles.tableColValue}>{enToBnNumber(student?.guardianPhone) || ""}</Text>
            <Text style={styles.tableColLabel}> অভিভাবকের ঠিকানা: </Text>
            <Text style={styles.tableColValue}>{student?.gurdiant_adress || ""}</Text>
          </View>
        </View>




<View style={styles.table1}>
  {/* Table Header */}
  <View style={styles.tableRow1}>
    <Text style={styles.tableCol}> মাসিক বেতন </Text>
    <Text style={styles.tableCol}> গারিভাড়া </Text>
    <Text style={styles.tableCol}> খোরাকি </Text>
    <Text style={styles.tableCol}> আবাসিক </Text>
    <Text style={styles.tableCol}> বোর্ডিং </Text>
    <Text style={styles.tableCol}> এতিম </Text>
  </View>

  {/* Single row for current student */}
  <View style={styles.tableRow1}>
    <Text style={styles.tableCol}>{enToBnNumber(student.monthlyBeton)} /=</Text>
    <Text style={styles.tableCol}>{enToBnNumber(student.monthlyGarivara)}  /= </Text>
    <Text style={styles.tableCol}>{enToBnNumber(student.khoraki)} /= </Text>
    <Text style={styles.tableCol}>{student.abasik ?"আবাসিক"
    : "অনাবাসিক"}</Text>
<Text style={styles.tableCol}>
  {student.bording_status == 0 ? "না" : "হ্যাঁ"}
</Text>

<Text style={styles.tableCol}>
  {student.orphen_state == 0 ? "না" : "হ্যাঁ"}
</Text>

  </View>
</View>



        {/* Signatures */}
        <View style={styles.signatureBoxContainer}>
          {["শিক্ষার্থীর স্বাক্ষর", "অভিভাবকের স্বাক্ষর", "লেখকের স্বাক্ষর", "মুহতামিমের স্বাক্ষর"].map(
            (label, idx) => (
              <View key={idx} style={styles.signatureBox}>
                <View style={styles.signatureLine} />
                 <Text>{label}</Text>
               
              </View>
            )
          )}
        </View>
      </Page>
    </Document>
  );
}

// Main Download Component
export default function DownloadAdmissionPDF() {
  const { id } = useParams(); // get student id from route param
  const [studentData, setStudentData] = useState(null);
  const [bivag,setBivag]=useState([]);
  const [jamat,setJamats]=useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchStudent = async () => {
    try {
      if (id) {
        const res1 = await ApiManager.get("/bivag");
        const res2 = await ApiManager.get("/jamat");
        const res = await ApiManager.get(`/student/${id}`);

        setStudentData(res);
        setBivag(res1);
        setJamats(res2); // ✅ FIXED

        await new Promise(r => setTimeout(r, 500));
      }
    } catch (err) {
      console.error("Failed to fetch student:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchStudent();
}, [id]);


  if (loading) return <p>⏳ লোড হচ্ছে...</p>;
  if (!studentData) return <p>❌ কোনো ডাটা পাওয়া যায়নি</p>;

  const formNumber = `${new Date().getFullYear()}-${studentData.id}`;

  return (
    <main className="main-container">
      <div style={{ textAlign: "center", margin: "20px" }}>
        <div style={{ border: "1px solid #ccc", marginBottom: "20px" }}>
       
          <PDFViewer style={{ width: "90%", height: "600px" }}>
            <AdmissionPDF student={studentData} formNumber={formNumber} bivag={bivag} jamats={jamat}/>
          </PDFViewer>
        </div>

        <PDFDownloadLink
          document={<AdmissionPDF student={studentData} formNumber={formNumber} bivag={bivag} jamats={jamat} />}
          fileName={`admission_form_${formNumber}.pdf`}
          style={{
            backgroundColor: "#250958",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
            textDecoration: "none",
          }}
        >
          {({ loading }) => (loading ? "PDF তৈরি হচ্ছে..." : "PDF ডাউনলোড")}
        </PDFDownloadLink>
      </div>
    </main>
  );
}
