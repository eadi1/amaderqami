// SheetPlanPreview.js
import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import SheetPlanPDF from "../pdf/SheetPlanPdf";

export default function SheetPlanPreview() {
  const students = [
      {
      name: "Student 1",
      roll: "101",
      className: "Class 5",
      exam: "Half Yearly",
      session: "2025",
      institute: "Plazma Admission Coaching",
      address1: "Uttara, Dhaka",
      address2: "Bangladesh",
    },  {
      name: "Student 1",
      roll: "101",
      className: "Class 5",
      exam: "Half Yearly",
      session: "2025",
      institute: "Plazma Admission Coaching",
      address1: "Uttara, Dhaka",
      address2: "Bangladesh",
    },
   
  ];

  return (
    <main className="main-container">
    <div style={{ height: "100vh" }}>
      <PDFViewer width="100%" height="100%">
        <SheetPlanPDF data={students} />
      </PDFViewer>
    </div></main>
  );
}
