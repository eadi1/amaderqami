import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Section from "../components/Section";

function SiteSettings() {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.xn--94b2eiu9e.xn--54b7fta0cc";

  const [settings, setSettings] = useState({
    institute_name_bn: "",
    institute_name_en: "",
    tagline: "",
    eiin_number: "",
    established_year: "",
    address: "",
    district: "",
    thana: "",
    village: "",
    phone: "",
    email: "",
    website: "",
    map_link: "",
    facebook_link: "",
    youtube_link: "",
    whatsapp_link: "",
    logo: null,
    idcard: null,
    header_image: null,
    footer_image: null,
    receipt_header_image: null,
    receipt_footer_image: null,
    watermark: null,
  });

  const [preview, setPreview] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/sitesetting");
      if (data) {
        setSettings(prev => ({
          ...prev,
          ...data,
          logo: null,
          header_image: null,
          footer_image: null,
          receipt_header_image: null,
          receipt_footer_image: null,
          watermark: null,
          idcard: null,
        }));

        setPreview({
          logo: data.logo ? `${API_URL}/uploads/${data.logo}` : null,
          header_image: data.header_image ? `${API_URL}/uploads/${data.header_image}` : null,
          footer_image: data.footer_image ? `${API_URL}/uploads/${data.footer_image}` : null,
          receipt_header_image: data.receipt_header_image ? `${API_URL}/uploads/${data.receipt_header_image}` : null,
          receipt_footer_image: data.receipt_footer_image ? `${API_URL}/uploads/${data.receipt_footer_image}` : null,
          watermark: data.watermark ? `${API_URL}/uploads/${data.watermark}` : null,
          idcard: data.idcard ? `${API_URL}/uploads/${data.idcard}` : null,
        });
      }
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e, field) => {
    setSettings(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 1) {
      toast.error(`${field.replaceAll("_", " ")} exceeds 1MB limit.`);
      return;
    }

    setSettings(prev => ({ ...prev, [field]: file }));
    setPreview(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(settings).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      await ApiManager.put("/sitesetting", formData, true);
      toast.success("✅ Settings updated successfully!");
      fetchSettings();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const textFields = [
    ["institute_name_bn", "Institute Name (Bangla)"],
    ["institute_name_en", "Institute Name (English)"],
    ["tagline", "Tagline"],
    ["eiin_number", "EIIN Number"],
    ["established_year", "Established Year"],
    ["address", "Address"],
    ["district", "District"],
    ["thana", "Thana"],
    ["village", "Village"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["website", "Website"],
    ["map_link", "Map Link"],
    ["facebook_link", "Facebook Link"],
    ["youtube_link", "YouTube Link"],
    ["whatsapp_link", "WhatsApp Number"],
  ];

  const fileFields = [
    "logo",
    "header_image",
    "footer_image",
    "receipt_header_image",
    "receipt_footer_image",
    "watermark",
    "idcard"
  ];

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1>Site Settings</h1>
      {loading && <p>Loading...</p>}
      
        <div className="settings-form">
          {textFields.map(([field, label]) => (
            <input
              key={field}
              type={field === "email" ? "email" : "text"}
              placeholder={label}
              value={settings[field] || ""}
              onChange={e => handleTextChange(e, field)}
            />
          ))}

          {fileFields.map(field => (
            <div key={field} className="file-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <label style={{ fontWeight: 600, marginBottom: 5 }}>{field.replaceAll("_", " ").toUpperCase()}</label>
              <input type="file" accept="image/*" onChange={e => handleFileChange(e, field)} />
              {preview[field] && (
                <img
                  src={preview[field]}
                  alt={field}
                  style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "cover", border: "1px solid #ccc", borderRadius: "6px" }}
                />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s ease-in-out",
              alignSelf: "flex-start"
            }}
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
     

      {/* In-page CSS */}
      <style>
        {`
          .settings-form {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 100%;
            margin: 0 auto;
          }
          .settings-form input[type="text"],
          .settings-form input[type="email"] {
            max-width: 100%;
            padding: 10px 12px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: border 0.2s ease-in-out;
            margin-bottom: 10px;
          }
          .settings-form input[type="text"]:focus,
          .settings-form input[type="email"]:focus {
            border-color: #4CAF50;
          }
          .settings-form button:hover:not(:disabled) {
            background-color: #45a049;
          }
          @media (max-width: 768px) {
            .settings-form {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </main>
  );
}

export default SiteSettings;
