import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiManager from "./apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // eye icon

function VerifyNew() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("পাসওয়ার্ড দিতে হবে");
      return;
    }

    setLoading(true);
    try {
      const res = await ApiManager.post(`/user/verify/${token}`, { password });
      toast.success(res.message || "পাসওয়ার্ড সফলভাবে সেট হয়েছে!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err?.error || "কিছু ভুল হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="app">
        <h1>নতুন পাসওয়ার্ড সেট করুন</h1>
        <form onSubmit={handleSubmit}>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="নতুন পাসওয়ার্ড"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "সেট করা হচ্ছে..." : "সেট করুন"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyNew;
