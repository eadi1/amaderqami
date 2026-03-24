import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// 🔤 Font registration
Font.register({
  family: "SolaimanLipi",
  src: "/fonts/SolaimanLipi.ttf",
});

// 🔢 Bangla digits
const toBanglaDigit = (num) => {
  const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  return num.toString().replace(/\d/g, d => bn[d]);
};

// 📄 Styles
const styles = StyleSheet.create({
  page: { padding: 10, fontSize: 10, fontFamily: "SolaimanLipi" },
  table: { display: "table", width: "100%", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  row: { flexDirection: "row" },
  cell: { borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 3, justifyContent: "center", alignItems: "center" },
  headerCell: { fontWeight: "bold", backgroundColor: "#e6e6e6", textAlign: "center" },
  holidayCell: { backgroundColor: "#ffe6e6" },
});

// 🔹 Main PDF Component
const AttendanceReportPDF = ({ students, monthYear, className, holidays = [] }) => {
  const [year, month] = monthYear.split("-").map(Number);
  const monthDays = new Date(year, month, 0).getDate();

const today = new Date();
const isCurrentMonth =
  today.getFullYear() === year && today.getMonth() + 1 === month;

// যদি আগের মাস হয় → পুরো মাস
// যদি এই মাস হয় → আজ পর্যন্ত
const currentDay = isCurrentMonth ? today.getDate() : monthDays;

  // All days of the month
  const monthDates = Array.from({ length: monthDays }, (_, i) => (i + 1).toString().padStart(2, "0"));

  const studentsPerPage = 20;
  const totalPages = Math.ceil(students.length / studentsPerPage);

  const getStudentsForPage = (pageIndex) => {
    const start = pageIndex * studentsPerPage;
    const end = start + studentsPerPage;
    return students.slice(start, end);
  };

  const stateMap = {
    p: "উ",  // Present
    l: "ছ",  // Leave
    a: "অ",  // Absent
    h: "ছুটি", // Holiday
  };

  // Check if day is Friday
  const isFriday = (day) => {
    const d = new Date(year, month - 1, parseInt(day));
    return d.getDay() === 5;
  };

  // Check if day is custom holiday
  const isHoliday = (day) => {
    const dateStr = `${year}-${month.toString().padStart(2,"0")}-${day}`;
    return holidays.includes(dateStr);
  };

  return (
    <Document>
      {Array.from({ length: totalPages }, (_, pageIndex) => (
        <Page
          key={pageIndex}
          size={"A4"}
          orientation="landscape"
          style={styles.page}
        >
          <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 10 }}>
            হাজিরা রিপোর্ট - {className} ({toBanglaDigit(monthYear)})
          </Text>

          <View style={styles.table}>
            {/* Header */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.headerCell, { width: "5%" }]}><Text> ক্রমিক </Text></View>
              <View style={[styles.cell, styles.headerCell, { width: "15%" }]}><Text> নাম </Text></View>
              <View style={[styles.cell, styles.headerCell, { width: "8%" }]}><Text> রোল </Text></View>

              {monthDates.map((day, i) => {
                const holiday = isFriday(day) || isHoliday(day);
                return (
                  <View
                    key={i}
                    style={[
                      styles.cell,
                      styles.headerCell,
                      holiday && styles.holidayCell,
                      { width: `${70 / monthDates.length}%` }
                    ]}
                  >
                    <Text>{toBanglaDigit(parseInt(day))}</Text>
                  </View>
                );
              })}
              <View style={[styles.cell, styles.headerCell, { width: "4%" }]}><Text>ছুটি</Text></View>

<View style={[styles.cell, styles.headerCell, { width: "5%" }]}><Text>অনুপস্থিত</Text></View>
              <View style={[styles.cell, styles.headerCell, { width: "4%" }]}><Text>উপস্থিত</Text></View>
            </View>

            {/* Students rows */}
            {getStudentsForPage(pageIndex).map((s, index) => {
              const attendanceMap = {};
              s.attendance.forEach(a => {
                const day = a.date.substring(8, 10);
                attendanceMap[day] = a.status;
              });

              let totalPresent = 0;

              return (
                <View style={styles.row} key={s.id}>
                  <View style={[styles.cell, { width: "5%" }]}><Text>{toBanglaDigit(pageIndex * studentsPerPage + index + 1)}</Text></View>
                  <View style={[styles.cell, { width: "15%" }]}><Text> {s.name} </Text></View>
                  <View style={[styles.cell, { width: "8%" }]}><Text>{toBanglaDigit(s.roll)}</Text></View>

                  {monthDates.map((day, i) => {
                    const dayNum = parseInt(day);
                    const holiday = isFriday(day) || isHoliday(day);
                    let status = "";

                    if (holiday) {
                      status = stateMap.h;
                    } else if (dayNum <= currentDay) {
                      status = attendanceMap[day] ? stateMap[attendanceMap[day].toLowerCase()] || "–" : "–";
                      if (status === "উ") totalPresent++;
                      //absent count
                      if (status === "অ") {s.absentCount = (s.absentCount || 0) + 1;}
                      //leave count
                      if (status === "ছ") {s.leaveCount = (s.leaveCount || 0) + 1;}
                    }

                    return (
                      <View key={i} style={[styles.cell, holiday && styles.holidayCell, { width: `${70 / monthDates.length}%` }]}>
                        <Text style={{ textAlign: "center", fontSize: 8 }}>{status}</Text>
                      </View>
                    );
                  })}

                  <View style={[styles.cell, { width: "4%" }]}><Text>{toBanglaDigit(s.leaveCount || 0)}</Text></View>
                  <View style={[styles.cell, { width: "5%" }]}><Text>{toBanglaDigit(s.absentCount || 0)}</Text></View>
                  <View style={[styles.cell, { width: "4%" }]}><Text>{toBanglaDigit(totalPresent)}</Text></View>
                </View>
              );
            })}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default AttendanceReportPDF;
