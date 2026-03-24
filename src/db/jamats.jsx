import { dbPromise } from "./db";

// Get all jamats from local DB
export const getJamatsFromDB = async () => {
  const db = await dbPromise;
  return db.getAll("jamats");
};

// Save or update jamats in local DB
export const saveJamatsToDB = async (items) => {
  const db = await dbPromise;
  const tx = db.transaction("jamats", "readwrite");
  items.forEach((i) => tx.store.put(i)); // put() will update if id exists
  await tx.done;
};

// Delete a jamat locally by id
export const deleteJamatFromDB = async (id) => {
  const db = await dbPromise;
  await db.delete("jamats", id);
};

// Replace a temporary ID with a real server ID after sync
export const replaceTempIdWithRealId = async (tempId, data) => {
  const db = await dbPromise;
  const tx = db.transaction("jamats", "readwrite");
  await tx.store.delete(tempId);
  await tx.store.put(data);
  await tx.done;
};

// ================= Sync server data =================
// Accept server response: { updated: [], deleted: [] }
export const syncJamatsWithServer = async (serverData) => {
  const { updated, deleted } = serverData;
  const db = await dbPromise;

  // 1️⃣ Apply updates
  if (updated && updated.length) {
    const tx = db.transaction("jamats", "readwrite");
    updated.forEach((item) => tx.store.put({ ...item, synced: true, temp_id: null }));
    await tx.done;
  }

  // 2️⃣ Apply deletions
  if (deleted && deleted.length) {
    const tx = db.transaction("jamats", "readwrite");
    for (const id of deleted) {
      await tx.store.delete(id);
    }
    await tx.done;
  }
};
