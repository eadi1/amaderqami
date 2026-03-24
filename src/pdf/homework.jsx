import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
const BASE_URL = import.meta.env.VITE_API_URL;
const proxyImage = (url) => `${BASE_URL}/proxy/${encodeURIComponent(url)}`;
// English digits to Bangla digits
const toBanglaNumber = (num) => {
  const banglaDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  return num.toString().split("").map(d => {
    if (/\d/.test(d)) return banglaDigits[parseInt(d)];
    return d;
  }).join("");
};

// -------------------------------------------
// 🔤 Register Bangla Font
// -------------------------------------------
Font.register({
  family: "SolaimanLipi",
  src: "/fonts/SolaimanLipi.ttf",
});

Font.register({
  family: "Galada-Regular",
  src: "/fonts/Galada-Regular.ttf",
});

Font.register({
  family: "Calligraf",
  src: "/fonts/Calligraf.ttf",
});
// -------------------------------------------
// 🔤 Register Arabic Font (Amiri)
// -------------------------------------------
Font.register({
  family: "Amiri",
  fonts: [
    { src: "/fonts/Amiri-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Amiri-Bold.ttf", fontWeight: "bold" },
  ],
});

// -------------------------------------------
// 🔍 Detect Arabic characters
// -------------------------------------------
const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

// -------------------------------------------
// 🔍 Split by newline (preserve white space)
// -------------------------------------------
const splitByLine = (text) => text.split(/\n/g);

// -------------------------------------------
// 🔍 Split mixed Bangla + Arabic text
// -------------------------------------------
const splitMixedText = (text) => {
  const regex = /([\u0600-\u06FF]+)/g;
  return text.split(regex).filter((t) => t !== "");
};

// Function to wrap Arabic words/letters only
const wrapArabic = (text) => {
  // Split text by Arabic segments
  const regex = /([\u0600-\u06FF]+)/g;
  const parts = text.split(regex).filter((t) => t !== "");

  return parts.map((part, index) => {
    const arabic = isArabic(part);
    return (
      <Text
        key={index}
        style={{
          fontFamily: arabic ? "Amiri" : "SolaimanLipi",
          fontWeight: arabic ? "bold" : "normal",
          fontSize: arabic ? 15 : 12,
          direction: arabic ? "rtl" : "ltr",
          textAlign: arabic ? "right" : "left",
        }}
      >
        {part}
      </Text>
    );
  });
};


// -------------------------------------------
// 🎨 Styles
// -------------------------------------------
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "SolaimanLipi",
    fontSize: 12,
    lineHeight: 1.5,
    position:"relative"
  },

  headerContainer: {
    textAlign: "center",
    marginBottom: 10,
  },
tableWatermark: {
  position: "absolute",
  top: "35%",         // টেবিলের একটু মধ্য ভাগে থাকবে
  left: "35%",
  width: "45%",       // টেবিল width-safe
  opacity: 0.08,
  transform: "translate(-50% -50%)",
  zIndex: -1,
},

  headerTitle: {
    fontSize: 25,
    fontFamily: "Galada-Regular",
    fontWeight: "bold",
    marginBottom: "10px",
  },

  headerSub: {
    fontSize: 12,
    marginBottom: 1,
  },

  headerRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },

  logo: {
    width: 60,
    height: 60,
  },

  instituteInfo: {
    flex: 1,
    textAlign: "center",
  },

  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  tableHeader: {
    backgroundColor: "#e8e8e8",
    fontWeight: "bold",
    fontSize: 15,
  },

  tableCell: {
    padding: 5,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    flexWrap: "wrap",
    fontSize:14,
  },

  kitabCol: { width: "20%" },
  descCol: { width: "60%" },
  comment: { width: "20%" },
});

// -------------------------------------------
// 📄 MAIN PDF COMPONENT
// -------------------------------------------
export default function HomeworkPDF({ homeworks, header }) {
  return (
    <Document>
      <Page style={styles.page} size="A4">
        {/* Header */}
 {/* 🔶 Watermark Behind Table */}
  {header.logo && (
    <Image
      src={proxyImage(`${BASE_URL}/uploads/${header.logo.replace(/\\/g, "/")}`)}
      style={styles.tableWatermark}
    />
  )}

{/* Header + Logo + Institute Info + Right Info */}
<View
  style={{
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderColor: "#000",
    paddingBottom: 5,
  }}
>
  {/* Left Logo */}
  <View style={{ width: "15%", alignItems: "flex-start" }}>
    {header.logo ? (
      <Image
        src={proxyImage(`${BASE_URL}/uploads/${header.logo.replace(/\\/g, "/")}`)}
        style={{ width: 60, height: 60 }}
      />
    ) : (
      <View style={{ width: 60, height: 60 }} />
    )}
  </View>

  {/* Middle: Institute Name + Address + Phone */}
  <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 5 }}>
  
    <Text
      style={{
        fontFamily: "Galada-Regular",
        fontSize: 24,
        textAlign: "center",
        marginBottom: 3,
      }}
      wrap
    >
      {header.institute_name_bn}
    </Text>
    <View style={{marginBottom:10,}} />
    <Text
      style={{
        fontFamily: "SolaimanLipi",
        fontSize: 12,
        textAlign: "center",
        marginBottom: 1,
      }}
      wrap
    >
      {header.address}
    </Text>
    <Text
      style={{
        fontFamily: "SolaimanLipi",
        fontSize: 12,
        textAlign: "center",
      }}
    >
      ফোন: {toBanglaNumber(header.phone)}
    </Text>
  </View>

  {/* Right: Class info */}
  <View
    style={{
      width: "25%",
      padding: 5,
      borderWidth: 1,
      borderColor: "#000",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontFamily: "SolaimanLipi", fontSize: 12, marginBottom: 2 }}>
      জামাত: {header.jamat_name}
    </Text>
    <Text style={{ fontFamily: "SolaimanLipi", fontSize: 12, marginBottom: 2 }}>
      শীট নাম্বার: {toBanglaNumber(header.sheet_number)}
    </Text>
    <Text style={{ fontFamily: "SolaimanLipi", fontSize: 12 }}>
      তারিখ: {toBanglaNumber(header.date)}
    </Text>
  </View>
</View>

{/* “বাড়ির কাজ” Title */}
<View
  style={{
    width: "100%",
    marginVertical: 10,
    alignItems: "center",
  }}
>
  <View
    style={{
      backgroundColor: "#000",
      paddingVertical: 5,
      paddingHorizontal: 20,
      borderRadius: 5,
    }}
  >
    <Text
      style={{
        color: "#fff",
        fontFamily: "SolaimanLipi",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      বাড়ির কাজ
    </Text>
  </View>
</View>


    
  
  
 
        {/* Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={{
              ...styles.tableCell, ...styles.kitabCol
              ,backgroundColor:"#000",color:"#fff",
              textAlign:"center",
              justifyContent:"center",
              display:"flex"
            }}>বিষয়</Text>
            <Text style={{
              ...styles.tableCell, ...styles.descCol
              ,backgroundColor:"#000",color:"#fff",
                textAlign:"center",
              justifyContent:"center",
              display:"flex"
            }}>বর্ণনা</Text>
            <Text style={{
              ...styles.tableCell, ...styles.comment
              ,backgroundColor:"#000",color:"#fff",
                textAlign:"center",
              justifyContent:"center",
              display:"flex"
            }}>মন্তব্য</Text>
          </View>

          {homeworks.map((hw, i) => (
            <View style={styles.tableRow} key={i}>
             <View
  style={{
    ...styles.tableCell,
    ...styles.kitabCol,
    justifyContent: "center", // vertical center
    alignItems: "center",     // horizontal center
    display: "flex",          // flex needed for justifyContent + alignItems
  }}
>
  <Text>{hw.kitab}</Text>
</View>


              {/* Description with mixed Arabic/Bangla */}
             <View style={[styles.tableCell, styles.descCol]}>
  {splitByLine(hw.description).map((line, lineIndex) => (
    <Text
      key={lineIndex}
      style={{
        fontSize: 12,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap", // preserves spaces and line breaks
      }}
    >
      {line.split(/([\u0600-\u06FF]+)/g).map((chunk, chunkIndex) => {
        const arabic = /[\u0600-\u06FF]/.test(chunk); // detect Arabic
        return (
          <Text
            key={chunkIndex}
            style={{
              fontFamily: arabic ? "Amiri" : "SolaimanLipi",
              fontWeight: arabic ? "bold" : "normal",
              fontSize: arabic ? 15 : 12,
              direction: arabic ? "rtl" : "ltr",
              textAlign: arabic ? "right" : "left",
            }}
          >
            {chunk}
          </Text>
        );
      })}
    </Text>
  ))}

</View>
              <Text style={[styles.tableCell, styles.comment]}>
                {hw.comment || ""}
              </Text>

            </View>
          ))}
        </View>
       
      </Page>
    </Document>
  );
}
