// src/utils/logger.js

const LOG_KEY = "app_logs";

export function addLog(message, type = "info") {
  const logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");

  const newLog = {
    message,
    type,
    time: new Date().toLocaleString(),
  };

  logs.push(newLog);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));

  // Also keep normal console logs
  if (type === "error") {
    console.error(message);
  } else {
    console.log(message);
  }
}

export function getLogs() {
  return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
}

export function clearLogs() {
  localStorage.removeItem(LOG_KEY);
}
