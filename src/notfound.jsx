import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
<main className="main-content">
      <h1 style={{ fontSize: "10rem", margin: 0, color: "#ff4c60" }}>404</h1>
      <h2 style={{ fontSize: "2rem", margin: "10px 0" }}>Page Not Found</h2>
      <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          textDecoration: "none",
          padding: "10px 25px",
          backgroundColor: "#4f46e5",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: "bold",
          transition: "0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#3730a3")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#4f46e5")}
      >
        Go to Home
      </Link>
    </main>
  );
}

export default NotFound;
