// localDbHelpers.js
import { dbPromise } from "./db";

export const getAllFromDB = async (table) => {
  const db = await dbPromise;
  return db.getAll(table);
};

export const saveToDB = async (table, items) => {
  const db = await dbPromise;
  const tx = db.transaction(table, "readwrite");
  items.forEach((i) => tx.store.put(i));
  await tx.done;
};

export const deleteFromDB = async (table, id) => {
  const db = await dbPromise;
  await db.delete(table, id);
};

export const addPending = async (request) => {
  const db = await dbPromise;
  await db.add("pending_requests", request);
};

export const getPending = async () => {
  const db = await dbPromise;
  return db.getAll("pending_requests");
};

export const clearPending = async () => {
  const db = await dbPromise;
  const tx = db.transaction("pending_requests", "readwrite");
  await tx.store.clear();
  await tx.done;
};
