// SheetPlanDocument.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
Font.register({
  family: "SolaimanLipi",
  src: "/fonts/SolaimanLipi.ttf",
});

Font.register({
  family: "Galada-Regular",
  src: "/fonts/Galada-Regular.ttf",
});
// ──────────────────────────────────────────
// Reusable Field Component
// ──────────────────────────────────────────
const Field = ({ value }) => (
  <View style={styles.fieldRow}>
    <View style={styles.fieldLabel}>
      <Text style={styles.fieldLabelText}> নাম </Text>
    </View>
    <View style={styles.fieldValue}>
      <Text style={styles.fieldValueText}>{value}</Text>
    </View>
  </View>
);

// 2 Column Field
const Field2 = ({  value1, value2 }) => (
  <View style={styles.field2Row}>
    {/* LEFT */}
    <View style={styles.field2Box}>
      <View style={styles.field2Label}>
        <Text style={styles.fieldLabelText}> শ্রেণী  </Text>
      </View>
      <View style={styles.field2Value}>
        <Text style={styles.fieldValueText}>{value1}</Text>
      </View>
    </View>

    {/* RIGHT */}
    <View style={styles.field2Box}>
      <View style={styles.field2Label}>
        <Text style={styles.fieldLabelText}> রোল  </Text>
      </View>
      <View style={styles.field2Value}>
        <Text style={styles.fieldValueText}>{value2}</Text>
      </View>
    </View>
  </View>
);

// ──────────────────────────────────────────
// Styles
// ──────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "SolaimanLipi",
    flexDirection: "row",
    flexWrap: "wrap",
  },

  sheetBox: {
    width: "48%",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    marginRight: "2%",
  },

  headerRow: { flexDirection: "row", marginBottom: 8 },

  logoBox: {
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: { width: 40, height: 40 },

  infoBox: {
    width: "75%",
    paddingLeft: 4,
  },

  textLine: { fontSize: 9, marginBottom: 2 },

  examTitle: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "bold",
    marginVertical: 5,
  },

  // FIELD SINGLE ROW
  fieldRow: {
    width: "90%",
    marginHorizontal: "5%",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    flexDirection: "row",
    marginTop: 5,
  },
  fieldLabel: {
    width: "30%",
    backgroundColor: "#000",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldLabelText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
  },
  fieldValue: { width: "70%", padding: 5 },
  fieldValueText: { fontSize: 10 },

  // FIELD TWO COLUMN
  field2Row: {
    width: "90%",
    marginHorizontal: "5%",
    flexDirection: "row",
    gap: 6,
    marginTop: 5,
  },
  field2Box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    flexDirection: "row",
  },
  field2Label: {
    width: "35%",
    backgroundColor: "#000",
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  field2Value: { width: "65%", padding: 4 },
});

// ──────────────────────────────────────────
// MAIN DOCUMENT
// ──────────────────────────────────────────

export default function SheetPlanDocument({ data = [] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {data.map((student, i) => (
          <View key={i} style={styles.sheetBox}>
            
            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.logoBox}>
                <Image
                  src={student.logo || "https://via.placeholder.com/80"}
                  style={styles.logo}
                />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.textLine}>{student.institute}</Text>
                <Text style={styles.textLine}>{student.address1}</Text>
                <Text style={styles.textLine}>{student.address2}</Text>
              </View>
            </View>
{/* LINE */}
<View
  style={{
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 4,
    width: "100%",
  }}
/>        {/* EXAM TITLE */}
            <Text style={styles.examTitle}>
              {student.exam} - Session {student.session}
            </Text>

            {/* FIELDS */}
            <Field  value={student.name} />
            <Field2
              
              value1={student.roll}
            
              value2={student.class}
            />
           
          </View>
        ))}
      </Page>
    </Document>
  );
}
