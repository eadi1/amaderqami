// utils/cacheImage.js
const DB_NAME = "APP_IMAGES_DB";
const STORE_NAME = "images";

const openDB = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const saveToDB = async (key, blob) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(blob, key);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

const getFromDB = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const cacheImage = async (url, key) => {
  if (!url || !key) return null;

  // 1️⃣ Check localStorage
  let cached = localStorage.getItem(key);
  if (cached) return cached;

  // 2️⃣ Check IndexedDB
  const blobFromDB = await getFromDB(key);
  if (blobFromDB) {
    return await blobToBase64(blobFromDB);
  }

  // 3️⃣ Fetch image
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error("Image fetch failed");
  const blob = await res.blob();

  // 4️⃣ Save based on size
  if (blob.size < 2 * 1024 * 1024) { // <2MB → localStorage
    const base64 = await blobToBase64(blob);
    localStorage.setItem(key, base64);
    return base64;
  } else { // large → IndexedDB
    await saveToDB(key, blob);
    return await blobToBase64(blob);
  }
};

// Convert Blob → base64
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export const getCachedImage = async (key) => {
  let cached = localStorage.getItem(key);
  if (cached) return cached;

  const blob = await getFromDB(key);
  if (!blob) return null;

  return await blobToBase64(blob);
};

export const clearCachedImage = async (key) => {
  localStorage.removeItem(key);
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(key);
  await new Promise((resolve) => (tx.oncomplete = resolve));
};

export const clearAllCachedImages = async () => {
  ["APP_LOGO", "APP_HEADER", "APP_FOOTER"].forEach(k =>
    localStorage.removeItem(k)
  );

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).clear();
  await new Promise((resolve) => (tx.oncomplete = resolve));
};
