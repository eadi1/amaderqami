import ApiManager from "../apimanger";
import { dbPromise } from "../db/db";

/**
 * Initial offline database fill
 * - Only fills EMPTY tables
 * - Skips already filled tables
 * - Saves last_sync time
 */
export async function autoFillLocalDB() {
  try {
    if (!navigator.onLine) {
      console.warn("⚠️ Offline mode: initial sync skipped");
      return;
    }

    const db = await dbPromise;

    // 🔹 API CALL
    const res = await ApiManager.get("/offline/initial-sync");
    const data = res.data; // IMPORTANT

    if (!data || typeof data !== "object") {
      console.error("❌ Invalid initial sync data");
      return;
    }

    for (const tableName of Object.keys(data)) {
      const table = tableName.trim();

      // 🔸 Store exists check
      if (!db.objectStoreNames.contains(table)) {
        console.warn(`❌ ObjectStore not found: ${table}`);
        continue;
      }

      // 🔸 Already filled check
      const existing = await db.getAll(table);
      if (existing.length > 0) {
        console.log(`⏭️ ${table} already has data, skipped`);
        continue;
      }

      // 🔸 Insert data
      const tx = db.transaction(table, "readwrite");
      const store = tx.objectStore(table);

      data[table].forEach(row => {
        store.put({
          ...row,
          synced: true,     // 🔥 mark synced
          temp_id: null
        });
      });

      await tx.done;
      console.log(`✅ ${table} filled (${data[table].length} rows)`);
    }

    // 🔹 Save last sync time
    localStorage.setItem(
      "last_initial_sync",
      new Date().toISOString()
    );

    console.log("🎉 Offline DB initial sync completed");

  } catch (error) {
    console.error("❌ Initial offline sync failed:", error);
  }
}
