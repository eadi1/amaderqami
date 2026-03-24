import ApiManager from "../apimanger";
import { dbPromise } from "./db";

export const getDivisions = async () => {
  const db = await dbPromise;
  const local = await db.getAll("bivag");

  if (local.length) return local;

  if (navigator.onLine) {
    const res = await ApiManager.get("/bivag");
    const tx = db.transaction("bivag", "readwrite");
    res.data.forEach((d) => tx.store.put(d));
    await tx.done;
    return res.data;
  }

  return [];
};
