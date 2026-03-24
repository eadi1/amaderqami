import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Verify() {
  const [searchParams] = useSearchParams(); // read query string
  const userid = searchParams.get("userid");
  const app_key = searchParams.get("app_key");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userid || !app_key) {
      setStatus("Invalid verification link.");
      toast.error("Invalid verification link.");
      setLoading(false);
      return;
    }

    const verifyAccount = async () => {
      try {
        const res = await fetch(
          `https://api.xn--94b2eiu9e.xn--54b7fta0cc/api/registrationint/verify/${userid}/${app_key}`
        );
        const data = await res.text(); // backend returns plain text

        toast.info(data);
        setStatus(data);

        if (data.includes("successfully")) {
          setTimeout(() => navigate("/"), 3000); // redirect after 3 sec
        }
      } catch (err) {
        console.error(err);
        toast.error("Verification failed!");
        setStatus("Verification failed!");
      } finally {
        setLoading(false);
      }
    };

    verifyAccount();
  }, [userid, app_key, navigate]);

  return (
    <div className="verify-container">
      <ToastContainer position="top-right" autoClose={3000} />
      {loading ? (
        <div className="loading">Verifying your account...</div>
      ) : (
        <div className={`status ${status.includes("successfully") ? "success" : "error"}`}>
          {status}
          {status.includes("successfully") && <p>Redirecting to login...</p>}
        </div>
      )}
    </div>
  );
}

export default Verify;
