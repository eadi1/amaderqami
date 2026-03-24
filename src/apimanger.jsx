// src/api/ApiManager.js
import Cookies from "js-cookie";

const BASE_URL = "https://api.amaderqawmi.top/api"; // change as needed

// Helper to get headers
const getHeaders = (isJson = true) => {
  const token = Cookies.get("token");
  const headers = {};

  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
};

// Helper to clear all cookies
const clearAllCookies = () => {
  const allCookies = Cookies.get();
  for (let cookieName in allCookies) {
    Cookies.remove(cookieName);
  }
};

// Handle response safely
const handleResponse = async (res) => {
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null; // empty response
  }

  // Normal error handling
  if (!res.ok) {
    const error = (data && (data.message || data.error)) || res.statusText;

    // 🔹 Package expired (backend থেকে special status)
  

    // 🔹 Token expired / unauthorized
    if (res.status === 401 || res.status === 403) {
      clearAllCookies(); 
      window.location.href = "/login"; // login page
      return;
    }

    throw new Error(error);
  }
  if (data?.status === "PACKAGE_EXPIRED") {
     
      window.location.href = "/site-settings/package-management"; // প্যাকেজ ক্রয় পেজে পাঠাও
      return;
    }
  return data;
};

const ApiManager = {
  get: async (endpoint) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("GET Error:", err.message);
      throw err;
    }
  },

  post: async (endpoint, body, isFormData = false) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: isFormData ? getHeaders(false) : getHeaders(),
        body: isFormData ? body : JSON.stringify(body),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("POST Error:", err.message);
      throw err;
    }
  },

  put: async (endpoint, body, isFormData = false) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: isFormData ? getHeaders(false) : getHeaders(),
        body: isFormData ? body : JSON.stringify(body),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("PUT Error:", err.message);
      throw err;
    }
  },
 patch: async (endpoint, body, isFormData = false) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PATCH", // fixed typo: "mathod" → "method"
      headers: isFormData ? getHeaders(false) : getHeaders(),
      body: isFormData ? body : JSON.stringify(body),
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("PATCH Error:", err.message); // fixed error message
    throw err;
  }
},


 delete: async (endpoint, data = null) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
      // যদি ডাটা থাকে, তবে সেটি JSON string করে বডিতে পাঠানো হবে
      body: data ? JSON.stringify(data) : null,
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("DELETE Error:", err.message);
    throw err;
  }
},
};

export default ApiManager;
