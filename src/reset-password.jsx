import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./auth.css";
function ResetPassword() {
  const { token } = useParams(); // ✅ get token from URL param
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://api.xn--94b2eiu9e.xn--54b7fta0cc/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setTimeout(() => navigate("/"), 2000); // redirect to login
      } else {
        toast.error(data.message || "Reset failed!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="app">
        <ToastContainer />
        <h2>Invalid or missing token</h2>
      </div>
    );
  }

  return (
    <div className="auth">
        <div className="app">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
    </div>
  );
}

export default ResetPassword;
