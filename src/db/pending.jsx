import { dbPromise } from "./db";

export async function addPendingRequest(request) {
  const db = await dbPromise;
  await db.add("pending_requests", request);
}

export async function getAllPendingRequests() {
  const db = await dbPromise;
  return await db.getAll("pending_requests");
}

export async function clearPendingRequests() {
  const db = await dbPromise;
  const tx = db.transaction("pending_requests", "readwrite");
  await tx.store.clear();
  await tx.done;
}
