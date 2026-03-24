// db.js
import { openDB } from "idb";

export const dbPromise = openDB("school-db", 1, {
  upgrade(db) {
    const offlineTables = [
      "students",
      "teachers",
      "attendance",
      "fees",
      "jamats",
      "bivag",
      "division",
      "district",
      "student_fees",
      "examtype",
      "fee_types",
      "kitab",
      "qawmi_books"
    ];

    offlineTables.forEach((table) => {
      if (!db.objectStoreNames.contains(table)) {
        db.createObjectStore(table, { keyPath: "id" });
      }
    });

    if (!db.objectStoreNames.contains("pending_requests")) {
      db.createObjectStore("pending_requests", { keyPath: "temp_id", autoIncrement: true });
    }
  },
});
