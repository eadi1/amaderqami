import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Auth.css";
import Cookies from "js-cookie";
import ApiManager from "./apimanger";
import { cacheImage } from "./utils/cacheImage";

function App() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 const API_URL = import.meta.env.VITE_API_URL || "https://api.xn--94b2eiu9e.xn--54b7fta0cc";

  const [signUpData, setSignUpData] = useState({
    institute_name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    picture: null
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [preview, setPreview] = useState(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  const handleChange = (e, type) => {
    const { name, value, files } = e.target;
    if (type === "signup") {
      if (name === "picture") {
        const file = files[0];
        if (file) {
          setSignUpData((prev) => ({ ...prev, picture: file }));
          setPreview(URL.createObjectURL(file));
        }
      } else setSignUpData((prev) => ({ ...prev, [name]: value }));
    } else if (type === "login") {
      setLoginData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "signup") {
        const formData = new FormData();
        Object.entries(signUpData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) formData.append(key, value);
        });

        const data = await ApiManager.post("/registrationint", formData, true);

        if (data.success) {
          toast.success(data.message);
          setSignUpData({ institute_name: "", phone: "", address: "", email: "", password: "", picture: null });
          setPreview(null);
          setIsSignUp(false);
        } else toast.error(data.message);

      } else if (type === "login") {
        const data = await ApiManager.post("/login", loginData);

        if (data && data.token) {
          const { user, token, expires_in } = data;
          const cookieOptions = { secure: true, sameSite: "strict" };
          if (expires_in) cookieOptions.expires = new Date(Date.now() + expires_in * 1000);
console.log(user);
          Cookies.set("userId", user.id, cookieOptions);
          Cookies.set("role", user.role, cookieOptions);
          Cookies.set("token", token, cookieOptions);
          Cookies.set("app_key", user.app_key, cookieOptions);
          Cookies.set("picture", user.picture, cookieOptions);
          Cookies.set("institute_name_bn", user.institute_name_bn, cookieOptions);
          Cookies.set("institute_name_en", user.institute_name_en, cookieOptions);
          Cookies.set("address", user.address, cookieOptions);
          Cookies.set("phone", user.phone, cookieOptions);
          Cookies.set("logo", user.logo, cookieOptions);
          
await Promise.all([
  user.logo && cacheImage(`${API_URL}/uploads/${user.logo}`, "APP_LOGO"),
  user.header && cacheImage(`${API_URL}/uploads/${user.header}`, "APP_HEADER"),
  user.footer && cacheImage(`${API_URL}/uploads/${user.footer}`, "APP_FOOTER"),
]);


          Cookies.set("permissions", JSON.stringify(user.permissions || []), cookieOptions);

          toast.success("Login Successful!");
          setTimeout(() => window.location.reload(), 1000);
        } else toast.error(data || "Invalid credentials!");

      } else if (type === "forgot") {
        const data = await ApiManager.post("/forgot-password/request", { email: forgotEmail });
        if (data.success) {
          toast.success("Password reset link sent!");
          setForgotEmail("");
          setIsForgotPassword(false);
        } else toast.error(data.message);
      }

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="app">
        {isSignUp ? (
          <>
            <h1>Sign Up</h1>
            <form className="form" onSubmit={(e) => handleSubmit(e, "signup")}>
              {["institute_name", "phone", "address", "email"].map((field) => (
                <input
                  key={field}
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  placeholder={field.replaceAll("_", " ").toUpperCase()}
                  value={signUpData[field]}
                  onChange={(e) => handleChange(e, "signup")}
                  required
                />
              ))}

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={signUpData.password}
                  onChange={(e) => handleChange(e, "signup")}
                  required
                />
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>

              <input type="file" name="picture" accept="image/*" onChange={(e) => handleChange(e, "signup")} />
              {preview && <img src={preview} alt="Preview" className="image-preview" />}

              <button type="submit" disabled={loading}>{loading ? "Please wait..." : "Sign Up"}</button>
            </form>
          </>
        ) : isForgotPassword ? (
          <>
            <h1>Forgot Password</h1>
            <form className="form" onSubmit={(e) => handleSubmit(e, "forgot")}>
              <input type="email" placeholder="Enter your email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
            </form>
            <div className="toggle-link" onClick={() => setIsForgotPassword(false)}>Back to Login</div>
          </>
        ) : (
          <>
            <h1>Login</h1>
            <form className="form" onSubmit={(e) => handleSubmit(e, "login")}>
              <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={(e) => handleChange(e, "login")} required />

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => handleChange(e, "login")}
                  required
                />
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>

              <button type="submit" disabled={loading}>{loading ? "Please wait..." : "Login"}</button>
            </form>
            <div className="toggle-link" onClick={() => setIsForgotPassword(true)}>Forgot Password?</div>
          </>
        )}

        <div className="toggle-link" onClick={() => { setIsSignUp(!isSignUp); setIsForgotPassword(false); }}>
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </div>
      </div>
    </div>
  );
}

export default App;
