import React from "react";
import { Page, Text, View, Document, StyleSheet, Image, Font } from "@react-pdf/renderer";

const BASE_URL = import.meta.env.VITE_API_URL;
const proxyImage = (url) => `${BASE_URL}/proxy/${encodeURIComponent(url)}`;

Font.register({
  family: "SolaimanLipi",
  src: `${BASE_URL}/fonts/SolaimanLipi.ttf`,
});
const banglaNumberWords = [
  '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
  'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ',
  'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাতত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
  'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
  'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
  'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
  'একাত্তর', 'বাহাত্তর', 'তেহাত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছেয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
  'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশী', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই', 'নব্বই',
  'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছেয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];
function toBanglaWords(amount) {
  let num = parseInt(amount);
  if (num === 0) return "শূন্য টাকা মাত্র।";
  
  let words = "";

  if (Math.floor(num / 10000000) > 0) {
    words += toBanglaWords(Math.floor(num / 10000000)).replace(" টাকা মাত্র।", "") + " কোটি ";
    num %= 10000000;
  }
  if (Math.floor(num / 100000) > 0) {
    words += banglaNumberWords[Math.floor(num / 100000)] + " লক্ষ ";
    num %= 100000;
  }
  if (Math.floor(num / 1000) > 0) {
    words += banglaNumberWords[Math.floor(num / 1000)] + " হাজার ";
    num %= 1000;
  }
  if (Math.floor(num / 100) > 0) {
    words += banglaNumberWords[Math.floor(num / 100)] + "শত ";
    num %= 100;
  }
  if (num > 0) {
    words += banglaNumberWords[num];
  }

  return words.trim() + " টাকা মাত্র।";
}

function toBanglaDigit(number) {
  if (number === null || number === undefined) return '';
  const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return number.toString().replace(/\d/g, d => banglaDigits[d]);
}

const toBanglaDate = (date) => {
  const d = new Date(date);
  return `${toBanglaDigit(d.getDate())}-${toBanglaDigit(d.getMonth() + 1)}-${toBanglaDigit(d.getFullYear())}`;
};

const styles = StyleSheet.create({
  page: { 
    fontFamily: "SolaimanLipi", 
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#fff"
  },
  receiptWrapper: {
    width: "50%",
    height: "50%",
    padding: 5,
  },
  innerBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "dashed",
    padding: 8,
  },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", marginBottom: 5, paddingBottom: 3 },
  logo: { width: 40, height: 40, marginRight: 5 },
  headerText: { flex: 1, textAlign: "center" },
  titleBox: { backgroundColor: "#222", alignSelf: "center", paddingHorizontal: 10, paddingVertical: 2, marginBottom: 5 },
  table: { width: "100%", marginTop: 5 },
  tableRow: { flexDirection: "row" },
  tableCell: { borderWidth: 1, borderColor: "#000", padding: 2, fontSize: 10 },
  signatureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: "auto", paddingTop: 10 }
});

export default function ReceiptPDF({ data, boinumber, roshidnumber,payment_date }) {
  const { student, payments } = data;
  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.paid_amount || 0), 0).toFixed(0);
  const currentDate = toBanglaDate(new Date());
  const pDate = student?.payment_date ? new Date(student.payment_date) : new Date();
  const formattedPaymentDate = `${toBanglaDigit(pDate.getDate())}-${toBanglaDigit(pDate.getMonth() + 1)}-${toBanglaDigit(pDate.getFullYear())}`;


  // ৪টি স্লট তৈরি করছি
  const slots = [0, 1, 2, 3];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {slots.map((index) => (
          <View key={index} style={styles.receiptWrapper}>
          
           {index === 0 ? (
                <>
                  <View style={styles.innerBorder}>
              
              {/* শুধু প্রথম স্লটে (index 0) ডাটা দেখাবে */}
             
                  {/* Header */}
                  <View style={styles.headerRow}>
                    {student.logo && <Image src={proxyImage(`${BASE_URL}/uploads/${student.logo.replace(/\\/g, "/")}`)} style={styles.logo} />}
                    <View style={styles.headerText}>
                      <Text style={{ fontSize: 12, fontWeight: "bold" }}>{student.int_name}</Text>
                      <Text style={{ fontSize: 8 }}>{student.int_address}</Text>
                    </View>
                  </View>

                  <View style={styles.titleBox}>
                    <Text style={{ color: "#fff", fontSize: 10 }}> রসিদ </Text>
                  </View>

                  {/* Receipt Info */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 9, marginBottom: 5 }}>
                    <Text>রসিদ নং: {toBanglaDigit(roshidnumber)}</Text>
                    <Text>তারিখ: { formattedPaymentDate }</Text>
                  </View>

                  {/* Student Info */}
                  <View style={{ fontSize: 10, marginBottom: 5 }}>
                    <Text>নাম: {student.student_name } </Text>
                    <View style={{ flexDirection: "row", marginTop: 2 }}>
                      <Text style={{ flex: 1 }}>জামাত: { student.jamat_name } </Text>
                      <Text>রোল: {toBanglaDigit(student.roll)}</Text>
                    </View>
                  </View>

                  {/* Table */}
                 <View style={{ width: "100%", marginTop: 5, borderTopWidth: 1, borderLeftWidth: 1, borderColor: "#000" }}>
      {/* Table Header */}
      <View style={{ flexDirection: "row" }}>
        <Text style={[styles.tableCell, { width: "20%", backgroundColor: "#eee", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0,textAlign: "center" }]}> ক্রমিক </Text>
        <Text style={[styles.tableCell, { width: "50%", backgroundColor: "#eee", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0, textAlign: "center" }]}> বিবরণ </Text>
        <Text style={[styles.tableCell, { width: "30%", backgroundColor: "#eee", textAlign: "center", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0 }]}> টাকা </Text>
      </View>

      {/* Table Rows */}
      {payments.slice(0, 5).map((p, i) => (
        <View key={i} style={{ flexDirection: "row" }}>
          <Text style={[styles.tableCell, { width: "20%", textAlign: "center", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0 }]}>{toBanglaDigit(i + 1)}</Text>
          <Text style={[styles.tableCell, { width: "50%", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0 }]}>{p.fee_type_name }</Text>
          <Text style={[styles.tableCell, { width: "30%", textAlign: "right", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0 }]}>{toBanglaDigit(p.paid_amount)}/-</Text>
        </View>
      ))}

      {/* Total Row */}
      <View style={{ flexDirection: "row" }}>
        <Text style={[styles.tableCell, { width: "20%", textAlign: "right", fontWeight: "bold", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0 }]}> মোট: </Text>
        <Text style={[styles.tableCell, { width: "80%", textAlign: "right", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0 }]}>{toBanglaDigit(totalAmount)}/-</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <Text style={[styles.tableCell, { width: "20%", textAlign: "right", fontWeight: "bold", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0 }]}> কোথায়: </Text>
        <Text style={[styles.tableCell, { width: "80%", textAlign: "right", borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0 }]}>{ toBanglaWords(totalAmount) } </Text>
      </View>
    </View>
  
                  {/* Signature */}
                  <View style={styles.signatureRow}>
                    <View style={{ borderTopWidth: 1, width: 60 }}>
                      <Text style={{ fontSize: 8, textAlign: "center" }}>গ্রহীতা</Text>
                    </View>
                    <View style={{ borderTopWidth: 1, width: 60 }}>
                      <Text style={{ fontSize: 8, textAlign: "center" }}>আদায়কারী</Text>
                    </View>
                  </View>

                  {/* Footer */}
        {/* সতর্কবার্তা (Disclaimer) */}
<Text style={{ fontSize: 7, color: "#555", marginTop: 10, textAlign: "center", borderTopWidth: 0.5, borderTopColor: "#eee", paddingTop: 3 }}>

  রসিদটি সংরক্ষণ করুন, এটি ভবিষ্যতে প্রয়োজন হতে পারে। কলম দ্বারা কোনো পরিবর্তন অগ্রহণযোগ্য ।

</Text>

{/* Footer Info (Boi No, Soft Name, Print Date) */}
<View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
  <Text style={{ fontSize: 7, color: "#666" }}>বই নং: {toBanglaDigit(boinumber)} </Text>
  <Text style={{ fontSize: 7, color: "#999" }}>সফটওয়্যার সৌজন্যে: আমাদের কওমি </Text>
  <Text style={{ fontSize: 7, color: "#666" }}>প্রিন্ট: {toBanglaDigit(new Date().toLocaleDateString('bn-BD'))}</Text>
</View>
                   </View>
                </>
              ) : (
                /* বাকি ৩টি স্লট একদম খালি থাকবে কিন্তু ড্যাশড বর্ডার থাকবে */
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                   <Text style={{ color: '#fff', fontSize: 8 }}>.</Text>
                </View>
              )}

           
          </View>
        ))}
      </Page>
    </Document>
  );
}