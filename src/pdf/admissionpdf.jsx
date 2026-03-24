import React from "react";
import { useLocation } from "react-router-dom";
const BASE_URL =import.meta.env.VITE_API_URL;
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




Font.register({
  family: "SolaimanLipi",
  src: `${window.location.origin}/fonts/SolaimanLipi.ttf`,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "SolaimanLipi", // apply the Bangla font
    fontSize: 14,
    padding: 20,
    width: "210mm",
    height: "297mm",
  },
  headerImg: {
    width: "100%",
    height: 150,
    marginBottom: 10,
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
    height: 140,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: "#420808",
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 5,
    color: "#250958",
    borderBottomWidth: 2,
    borderBottomColor: "#250958",
    borderBottomStyle: "solid",
    paddingBottom: 2,
  },
  table: {
    display: "table",
    width: "auto",
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColLabel: {
    width: "25%",
   marginLeft:10,
    padding: 2,
    fontWeight: "bold",
  },
  tableColValue: {
    width: "25%",
    borderBottomWidth: 1,
    borderBottomColor: "#250958",
    padding: 2,
  },
  signatureBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  signatureBox: {
    width: "23%",
    textAlign: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginTop: 50,
  },
});

function AdmissionPDF({ student, formNumber }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {student.header_image && (
  <Image
    style={styles.headerImg}
    src={`${BASE_URL}/uploads/${student.header_image.replace(/\\/g, "/")}`}
  />
)}

        <View style={styles.headerSection}>
          <View style={{ width: "35%" }}>
            <Text>ফর্ম নং: {formNumber || ""}</Text>
            <Text>
              ভর্তির তারিখ:{" "}
              {student.admissionDate
                ? new Date(student.admissionDate).toLocaleDateString("en-GB")
                : ""}
            </Text>
          </View>
          <Text style={styles.headerTitle}> ভর্তি ফর্ম </Text>
          <View style={{ width: "35%", alignItems: "flex-end" }}>
          {student.photo && (
 <Image
    style={styles.studentPhoto}
    src={`${BASE_URL}/${student.photo.replace(/\\/g, "/")}`}
    alt={`${BASE_URL}/${student.photo.replace(/\\/g, "/")}`}
  />
)}

          </View>
        </View>

        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}> নাম: </Text>
            <Text style={styles.tableColValue}> { student.name } </Text>
            <Text style={styles.tableColLabel}> জন্ম তারিখ: </Text>
            <Text style={styles.tableColValue}>
              {student.dob
                ? new Date(student.dob).toLocaleDateString('en-GB')
                : ""}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}> পিতার নাম: </Text>
            <Text style={styles.tableColValue}>{ student.fatherName }</Text>
            <Text style={styles.tableColLabel}>মাতার নাম:</Text>
            <Text style={styles.tableColValue}>{ student.motherName }</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>রোল:</Text>
            <Text style={styles.tableColValue}>{ student.roll}</Text>
            <Text style={styles.tableColLabel}>ফোন:</Text>
            <Text style={styles.tableColValue}>{student.phone}</Text>
          </View>
          <View style={styles.tableRow}>
            
            <Text style={styles.tableColLabel}>ঠিকানা:</Text>
            <Text style={styles.tableColValue}>{student.union_name},{student.sub_district_name},{student.district_name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>জামাত:</Text>
            <Text style={styles.tableColValue}>{student.jamat}</Text>
            <Text style={styles.tableColLabel}>সেশন:</Text>
            <Text style={styles.tableColValue}>{student.session}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>ভর্তির তারিখ:</Text>
            <Text style={styles.tableColValue}>
              {student.admissionDate
                ? new Date(student.admissionDate).toLocaleDateString("en-GB")
                : ""}
            </Text>
            <Text style={styles.tableColLabel}>ত্যাগের তারিখ:</Text>
            <Text style={styles.tableColValue}>
              {student.leavingDate
                ? new Date(student.leavingDate).toLocaleDateString("en-GB")
                : ""}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>অভিভাবকের নাম:</Text>
            <Text style={styles.tableColValue}>{student.gurdiantName}</Text>
            <Text style={styles.tableColLabel}>সম্পর্ক:</Text>
            <Text style={styles.tableColValue}>{student.gurdiantRelation}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>অভিভাবকের ফোন:</Text>
            <Text style={styles.tableColValue}>{student.guardianPhone}</Text>
            <Text style={styles.tableColLabel}>অভিভাবকের ঠিকানা:</Text>
            <Text style={styles.tableColValue}>{student.gurdiantAdress}</Text>
          </View>
        </View>

        <View style={styles.signatureBoxContainer}>
          <View style={styles.signatureBox}>
            <Text>শিক্ষার্থীর স্বাক্ষর</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureBox}>
            <Text>অভিভাবকের স্বাক্ষর</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureBox}>
            <Text>লেখকের স্বাক্ষর</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureBox}>
            <Text>মুহতামিমের স্বাক্ষর</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
      </Page>
    </Document>
  );
}

