import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModalBox from "../components/modelbox";
import Table from "../components/Table";
import { Link } from "react-router-dom";
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: null,
    user: "",
    role: "",
    name: "",
    picture: null,
    teacher: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
const [teachers, setTeachers] = useState([]);


  // 🔹 Load users initially
  useEffect(() => {
    fetchUsers();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await ApiManager.get("/teacher");
      setTeachers(data.data);
    } catch (err) {
      toast.error("Teacher data load failed!");
      console.error(err);
    } 
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/user/users");
      setUsers(data);
    } catch (err) {
      toast.error("User data load failed!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentUser({
      id: null,
      user: "",
      name: "",
      role: "",
      picture: null,
      teacher: null,
    });
    setPreview(null);
    setShowModal(true);
  };

  const handleEdit = (u) => {
    setCurrentUser(u);
    setPreview(u.picture || null);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentUser({ ...currentUser, picture: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!currentUser.user.trim() || !currentUser.role.trim() || !currentUser.name.trim()) {
      toast.error("Fill all fields!");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", currentUser.name);
      formData.append("user", currentUser.user);
      formData.append("role", currentUser.role);
      formData.append("verified", currentUser.verified);
      formData.append("teacher", currentUser.teacher || "");
      if (currentUser.picture) formData.append("picture", currentUser.picture);

      if (currentUser.id) {
        // Update user
        await ApiManager.put(`/user/${currentUser.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("User updated!");
      } else {
        // Create new user
        await ApiManager.post("/user/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("User created, verification email sent!");
      }

      fetchUsers();
      setShowModal(false);
    } catch (err) {
      toast.error("Save failed!");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", label: "নাম" },
    { key: "user", label: "Username" },
    { key: "role", label: "Role" },
    { key: "picture", label: "Picture" },
    { key: "verified", label: "Status" },
  
  ];

  const datatable = users.map((u) => ({
    ...u,
    picture: u.picture ? (
      <img src={u.picture} alt={u.user} style={{ width: 40, height: 50, borderRadius: 6 }} />
    ) : (
      "N/A"
    ),
    action: (
      <div>
        <Link
          className="btn btn-save"
          to={`privilege-management/${u.id}`}
          style={{ marginRight: 5 }}
        >
          ⚙️ Privileges
        </Link>
        <button
          className="btn btn-edit"
          onClick={() => handleEdit(u)}
          style={{ marginRight: 5 }}
        >
          ✏️ Edit
        </button>
        <button
          className="btn btn-delete"
          onClick={async () => {
            if (!window.confirm("Are you sure you want to delete this user?")) return;
            try {
              await ApiManager.delete(`/user/${u.id}`);
              setUsers(users.filter((user) => user.id !== u.id));
              toast.success("User deleted successfully!");
            } catch (err) {
              toast.error("Delete failed!");
              console.error(err);
            }
          }}
        >
          🗑️ Delete
        </button>
      </div>
    ),
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="user-management">
        <h1>User Management</h1>
        <div className="actions">
          <button className="btn btn-add" onClick={handleAdd}>
             Add New User
          </button>
        </div>

        {loading ? <p>Loading...</p> : <Table columns={columns} data={datatable} />}

        {showModal && (
        <ModalBox
  title={currentUser.id ? "Edit User" : "Add New User"}
  onClose={() => setShowModal(false)}
>
  {/* Teacher Select */}
  <div className="modal-form-row">
    <label>Teacher</label>
    <select
      value={currentUser.teacher || ""}
      onChange={(e) =>
        setCurrentUser({ ...currentUser, teacher: e.target.value })
      }
    >
      <option value="">-- Select Teacher --</option>
      {teachers.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  </div>

  {/* Name */}
  <div className="modal-form-row">
    <label>Name</label>
    <input
      type="text"
      placeholder="Name"
      value={currentUser.name}
      onChange={(e) =>
        setCurrentUser({ ...currentUser, name: e.target.value })
      }
    />
  </div>

  {/* Username */}
  <div className="modal-form-row">
    <label>Username</label>
    <input
      type="email"
      placeholder="Username"
      value={currentUser.user}
      onChange={(e) =>
        setCurrentUser({ ...currentUser, user: e.target.value })
      }
    />
  </div>

  {/* Role */}
  <div className="modal-form-row">
    <label>Role</label>
    <input
      type="text"
      placeholder="Role"
      value={currentUser.role}
      onChange={(e) =>
        setCurrentUser({ ...currentUser, role: e.target.value })
      }
    />
  </div>

  {/* Profile Picture */}
  <div className="modal-form-row">
    <label>Profile Picture</label>
    <input type="file" accept="image/*" onChange={handleFileChange} />
    {preview && (
      <img
        src={preview}
        alt="preview"
        style={{ width: 80, height: 100, marginTop: 5, borderRadius: 6 }}
      />
    )}
  </div>

  {/* Verification Status */}
  <div className="modal-form-row">
    <label>Verified</label>
    <select
      value={currentUser.verified}
      onChange={(e) =>
        setCurrentUser({ ...currentUser, verified: e.target.value })
      }
    >
      <option value="pending">Pending</option>
      <option value="verified">Verified</option>
    </select>
  </div>

  {/* Action Buttons */}
  <div className="modal-actions">
    <button className="btn btn-cancel" onClick={() => setShowModal(false)}>
      ❌ Cancel
    </button>
    <button className="btn btn-save" onClick={handleSave} disabled={saving}>
      {saving
        ? currentUser.id
          ? "Updating..."
          : "Saving..."
        : "💾 Save"}
    </button>
  </div>
</ModalBox>

        )}
      </div>
    </main>
  );
}
