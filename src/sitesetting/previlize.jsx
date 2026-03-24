import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const menus = [
  { key: "dashboard", label: "ড্যাশবোর্ড" },
  { key: "students", label: "শিক্ষার্থী ব্যবস্থাপনা" },
  { key: "teachers", label: "শিক্ষক ব্যবস্থাপনা" },
    { key: "teachers_corner", label: "শিক্ষক বাতায়ন" },
  { key: "accounting", label: "হিসাব-নিকাশ" },
  { key: "admission", label: "ভর্তি " },
  { key: "library", label: "গ্রন্থাগার" },
  { key: "exam", label: "পরীক্ষা" },
  { key: "reports", label: "প্রতিবেদন" },
  { key: "settings", label: "সেটিংস" },
];

function PrivilegeManager() {
  const { userId } = useParams();
  const [privileges, setPrivileges] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchPrivileges = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await ApiManager.get(`/privileges/${userId}`);
      if (res.success) {
        const privObj = {};
        res.data.forEach((p) => {
          privObj[p.menu_key.toLowerCase()] = p.can_access === 1;
        });
        setPrivileges(privObj);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load privileges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivileges();
  }, [userId]);

  const handleToggle = async (menuKey) => {
    const current = privileges[menuKey] || false;

    try {
      if (!current) {
        const res = await ApiManager.post("/privileges", {
          user_id: userId,
          menu_key: menuKey,
          can_access: 1,
        });
        if (res.success) toast.success(`Privilege for "${menuKey}" added`);
      } else {
        const existingRes = await ApiManager.get(`/privileges/${userId}`);
        const priv = existingRes.data.find(
          (p) => p.menu_key.toLowerCase() === menuKey
        );
        if (priv) {
          const delRes = await ApiManager.delete(`/privileges/${priv.id}`);
          if (delRes.success) toast.success(`Privilege for "${menuKey}" removed`);
        }
      }
      setPrivileges({ ...privileges, [menuKey]: !current });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update privilege");
    }
  };

  return (
    <div
      className="privilege-manager"
      style={{
        maxWidth: 500,
        margin: "20px auto",
        padding: 20,
        borderRadius: 12,
        background: "#1a1a1a",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Privilege Manager</h2>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {menus.map((menu) => (
          <li
            key={menu.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 15,
              padding: "10px 15px",
              borderRadius: 8,
              background: "#2c2c2c",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2c2c2c")}
          >
            <span>{menu.label}</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={privileges[menu.key] || false}
                onChange={() => handleToggle(menu.key)}
              />
              <span className="slider round"></span>
            </label>
          </li>
        ))}
      </ul>

      {/* Switch CSS */}
      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #4caf50;
        }
        input:checked + .slider:before {
          transform: translateX(26px);
        }
      `}</style>
    </div>
  );
}

export default PrivilegeManager;
