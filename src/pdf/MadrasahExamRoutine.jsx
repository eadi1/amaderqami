// MadrasahExamRoutine.jsx
import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";

// Fonts
Font.register({
  family: "Galada-Regular",
  src: "/fonts/Galada-Regular.ttf",
});
Font.register({
  family: "Calligraf",
  src: "/fonts/Calligraf.ttf",
});

// Convert digits to Bangla
const banglaDigits = (num) => {
  const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  return num.toString().replace(/\d/g, (d) => bn[d]);
};

// Format date + day in Bangla
const formatBanglaDate = (dateStr) => {
  const date = new Date(dateStr);

  const options = {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Dhaka",
  };

  const enDate = date.toLocaleDateString("en-GB", options);

  const dayMap = {
    Sunday: "রবিবার",
    Monday: "সোমবার",
    Tuesday: "মঙ্গলবার",
    Wednesday: "বুধবার",
    Thursday: "বৃহস্পতিবার",
    Friday: "শুক্রবার",
    Saturday: "শনিবার",
  };

  let day = "";
  let datePart = enDate;

  Object.keys(dayMap).forEach((d) => {
    if (enDate.includes(d)) {
      day = dayMap[d];
      datePart = enDate.replace(d + ", ", "");
    }
  });

  return {
    day,
    date: datePart.replace(/\d/g, (d) => banglaDigits(d)),
  };
};

// Normalize date for consistent key comparison
const toISODate = (dateStr) => new Date(dateStr).toISOString().split("T")[0];

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: "Galada-Regular",
    fontSize: 9,
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Calligraf",
    marginBottom: 5,
  },
  subTitle: {
    textAlign: "center",
    fontSize: 10,
    marginBottom: 5,
  },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: { flexDirection: "row" },
  tableCol: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  headerCol: { fontWeight: "bold" },
  classHeader: { fontWeight: "bold" },
  headerDate: { fontSize: 9, fontWeight: "bold" },
  headerDay: { fontSize: 8 },
  examCellText: { marginVertical: 0, fontSize: 9 },
});

export default function MadrasahExamRoutine({
  examsetup = {},
  classes = [],
  subjects = [],
  teachers = [],
  examSubjects = [],
}) {
  // Create fast lookup map for exam cells
  const examMap = {};
  examSubjects.forEach((x) => {
    const key = `${x.class_id}_${toISODate(x.exam_date)}`;
    examMap[key] = x;
  });

  // Unique exam dates (normalized)
  const examDates = Array.from(
    new Set(examSubjects.map((x) => toISODate(x.exam_date)))
  ).sort((a, b) => new Date(a) - new Date(b));

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Title */}
        <Text style={styles.title}>
          {examsetup.exam_type_name} - {examsetup.session_name}
        </Text>

        {/* Table */}
        <View style={styles.table}>

          {/* Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.headerCol]}>
              <Text>শ্রেণী</Text>
            </View>
            {examDates.map((d, i) => {
              const { day, date } = formatBanglaDate(d);
              return (
                <View key={i} style={[styles.tableCol, styles.headerCol]}>
                  <Text style={styles.headerDate}>{date}</Text>
                  <Text style={styles.headerDay}>{day}</Text>
                </View>
              );
            })}
          </View>

          {/* Class Rows */}
          {classes.map((cls) => (
            <View key={cls.id} style={styles.tableRow}>

              {/* Class Name */}
              <View style={[styles.tableCol, styles.classHeader]}>
                <Text>{cls.name}</Text>
              </View>

              {/* Exam Cells */}
              {examDates.map((d, i) => {
                const key = `${cls.id}_${d}`;
                const exam = examMap[key];

                if (exam) {
                  const subjectName =
                    subjects.find((s) => s.id === exam.subject_id)?.name || "N/A";
                  const teacherName =
                    teachers.find((t) => t.id === exam.teacher_id)?.name || "N/A";

                  return (
                    <View key={i} style={styles.tableCol}>
                      <Text style={styles.examCellText}>{subjectName}</Text>
                      <Text style={styles.examCellText}>({teacherName})</Text>
                    </View>
                  );
                }

                return (
                  <View key={i} style={styles.tableCol}>
                    <Text>***</Text>
                  </View>
                );
              })}

            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}