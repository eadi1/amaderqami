import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    user: "",
    picture: null,
    password: "",
    confirmPassword: "",
  });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔹 Fetch profile data
  const fetchProfile = async () => {
    try {
      const data = await ApiManager.get("/user/profile"); 
      setUser(data);
      setForm({
        name: data.name || "",
        user: data.user || "",
        picture: null,
        password: "",
        confirmPassword: "",
      });
      setPreview(data.picture || null);
    } catch (err) {
      toast.error("Failed to load profile!");
      console.error(err);
    }
  };

  // 🔹 Handle image file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, picture: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🔹 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Save profile changes
  const handleSave = async () => {
    if (!form.name.trim() || !form.user.trim()) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("user", form.user);
      if (form.picture) formData.append("picture", form.picture);
      if (form.password) formData.append("password", form.password);

      await ApiManager.put("/user/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      toast.error("Update failed!");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="profile-container">
       

        <div className="profile-card">
         <div className="profile-picture">
             <h1> Profile</h1>
  <label htmlFor="imgUpload" style={{ cursor: "pointer" }}>
    <img
      src={preview || "/default-avatar.png"}
      alt="Profile"
      style={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        border: "2px solid #ddd",
        display: "block",
        margin: "auto",
      }}
    />
  </label>
  <input
    type="file"
    id="imgUpload"
    accept="image/*"
    onChange={handleFileChange}
    style={{ display: "none" }}
  />
</div>


          <div className="profile-info">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <label>Email / Username</label>
            <input
              type="email"
              name="user"
              value={form.user}
              onChange={handleChange}
            />

            <label>Role</label>
            <input type="text" value={user.role} disabled />

            <label>Verified Status</label>
            <input type="text" value={user.verified} disabled />

            <label>New Password</label>
            <input
              type="password"
              name="password"
              placeholder="Leave blank to keep current"
              value={form.password}
              onChange={handleChange}
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <button
              className="btn btn-add"
              onClick={handleSave}
              disabled={saving}
              style={{ marginTop: 10 }}
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>
      </div>

<style jsx>{`
  .profile-container {
    max-width: 600px;
    margin: 30px auto;
    border-radius: 10px;
    overflow: hidden;
    background: #f7f1f118;
  }
  .profile-card {
    display: flex;
    min-height: 250px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }
  .profile-picture {
    background: #08021fff; /* left side color */
    flex: 1;
    display: flex;
    flex-direction: column; /* fix typo: colums → column */
    align-items: center;
    justify-content: start;
    padding: 20px;
    color: #fff;
  }
  .profile-picture h1 {
    text-align: center;
    margin-bottom: 15px;
    font-size: 20px;
  }
  .profile-info {
    flex: 2;
    background: #fff;
    display: flex;
    flex-direction: column;
    padding: 20px;
  }
  input[type="file"] {
    display: none;
  }
  input {
    margin-bottom: 10px;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
  label {
    font-weight: 600;
    margin-bottom: 5px;
  }
  @media (max-width: 768px) {
    .profile-card {
      flex-direction: column;
    }
    .profile-picture {
      border-radius: 10px 10px 0 0;
    }
    .profile-info {
      border-radius: 0 0 10px 10px;
    }
  }
`}</style>


    </main>
  );
}
