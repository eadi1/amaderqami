// sync.js
import ApiManager from "../apimanger";
import { saveToDB, getPending, clearPending, deleteFromDB } from "./localDbHelpers";

export const syncTable = async (table) => {
  if (!navigator.onLine) return;

  // 1️⃣ Sync pending changes
  const pending = await getPending();
  for (const p of pending) {
    try {
      if (p.type === `ADD_${table.toUpperCase()}`) {
        const res = await ApiManager.post(`/${table}`, p.data);
        await saveToDB(table, [{ ...res.data, synced: true }]);
      }
      if (p.type === `UPDATE_${table.toUpperCase()}`) {
        await ApiManager.put(`/${table}/${p.data.id}`, p.data);
        await saveToDB(table, [{ ...p.data, synced: true }]);
      }
      if (p.type === `DELETE_${table.toUpperCase()}`) {
        await ApiManager.delete(`/${table}/${p.id}`);
        await deleteFromDB(table, p.id);
      }
    } catch (err) {
      console.error(`${table} pending sync failed`, err);
    }
  }

  await clearPending();

  // 2️⃣ Fetch updates from server
  try {
    const lastSync = localStorage.getItem(`${table}_last_sync`) || "1970-01-01 00:00:00";
    const res = await ApiManager.get(`/sync/${table}?last_sync=${encodeURIComponent(lastSync)}`);
    const serverData = res.data.map((d) => ({ ...d, synced: true }));

    if (serverData.length) {
      await saveToDB(table, serverData);
      localStorage.setItem(`${table}_last_sync`, new Date().toISOString().slice(0, 19).replace("T", " "));
    }
  } catch (err) {
    console.error(`${table} server sync failed`, err);
  }
};
