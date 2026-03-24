// =======================
// STUDENT BIODATA VIEW
// =======================
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ApiManager from "../apimanger";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Section from "../components/Section";
import FeeCardTable from "../components/FeeCardTable";

export default function StudentBiodataView() {
  const { id } = useParams();
  const [student, setStudent] = useState({});
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
const [uploading, setUploading] = useState(false);

  const [jamats, setJamats] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [fees1, setFees] = useState([]);

  const fieldMap = {
    sub_district: "subDistrict",
    union_name: "unionName",
    orphen_state: "orphenState",
    gurdiant_name: "gurdiantName",
    gurdiant_relation: "gurdiantRelation",
    gurdiant_adress: "gurdiantAdress",
  };

  const BASE_URL = import.meta.env.VITE_API_URL || "";

  // ================= FETCH DATA =================
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const studentRes = await ApiManager.get(`/student/${id}`);
        setStudent(studentRes?.data || studentRes || {});
        const feeRes = await ApiManager.get(`/accounting/fees/card/${id}`);
        setFees(feeRes.fees || []);
        const jamatRes = await ApiManager.get("/jamat");
        setJamats(jamatRes || []);

        const sessionRes = await ApiManager.get("/session");
        setSessions(sessionRes || []);

        const divisionRes = await ApiManager.get("/address/divisions");
        setDivisions(divisionRes?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ================= CASCADING DROPDOWNS =================
  useEffect(() => {
    if (!student.division) {
      setDistricts([]);
      setSubDistricts([]);
      return;
    }
    ApiManager.get(`/address/districts/${student.division}`)
      .then(res => setDistricts(res?.data || []))
      .catch(() => setDistricts([]));
  }, [student.division]);

  useEffect(() => {
    if (!student.district) {
      setSubDistricts([]);
      return;
    }
    ApiManager.get(`/address/upazilas/${student.district}`)
      .then(res => setSubDistricts(res?.data || []))
      .catch(() => setSubDistricts([]));
  }, [student.district]);

  // ================= SAVE =================
  const handleEditClick = field => setEditField(field);
  const handleSave = async (field, newValue) => {
    try {
      const apiField = fieldMap[field] || field;
      let data = { [apiField]: newValue };

      // cascading reset
      if (field === "division") {
        data.district = null;
        data.subDistrict = null;
        data.unionName = null;
      }
      if (field === "district") {
        data.subDistrict = null;
        data.unionName = null;
      }
      if (field === "sub_district") {
        data.unionName = null;
      }

      await ApiManager.patch(`/student/${id}`, data, false);

      toast.success("সফলভাবে আপডেট হয়েছে");
      setStudent(prev => ({ ...prev, [field]: newValue }));
      setEditField(null);
    } catch (err) {
      console.error(err);
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    }
  };

  // ================= DATE FORMAT =================
  const formatDate = d => {
    if (!d || d === "0000-00-00") return "";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateForInput = d => {
    if (!d || d === "0000-00-00") return "";
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("photo", file);

  try {
    setUploading(true);

    await ApiManager.patch(
      `/student/${id}`,
      formData,
      true // ⚠️ multipart/form-data
    );

    toast.success("ছবি আপডেট হয়েছে");

    // refresh photo
    setStudent(prev => ({
      ...prev,
      photo: `uploads/students/student_${id}.${file.name.split(".").pop()}`
    }));

  } catch (err) {
    console.error(err);
    toast.error("ছবি আপলোড ব্যর্থ");
  } finally {
    setUploading(false);
    e.target.value = "";
  }
};
 
  const photoUrl = () => {
    if (!student.photo) return null;
    return String(student.photo).replace(/\\/g, "/");
  };

  if (loading) return <div>Loading...</div>;

  // ================= FIELDS =================
const fields = [
  { label: "শিক্ষার্থীর নাম", field: "name" },
  { label: "পিতার নাম", field: "fatherName" },
  { label: "মাতার নাম", field: "motherName" },
  { label: "ফোন", field: "phone" },
  { label: "জন্ম তারিখ", field: "dob", inputType: "date" },
  { label: "জামাত", field: "jamat", type: "select", options: jamats.map(j => ({ value: j.id, label: j.name })) },
  { label: "রোল নম্বর", field: "roll" },
  { label: "ভর্তির তারিখ", field: "admissionDate", inputType: "date" },
  { label: "ছাড়পত্রের তারিখ", field: "leavingDate", inputType: "date" },
  { label: "ইমেইল", field: "email", inputType: "email" },
  { label: "অভিভাবকের ফোন", field: "guardianPhone" },
  { label: "অভিভাবকের নাম", field: "gurdiantName" },
  { label: "অভিভাবকের সম্পর্ক", field: "gurdiantRelation" },
  { label: "অভিভাবকের ঠিকানা", field: "gurdiantAdress" },
  { label: "জন্ম নিবন্ধন নম্বর", field: "birthCertificateNo" },
  { label: "জাতীয় পরিচয়পত্র (NID)", field: "nid" },
  { label: "বিভাগ", field: "division", type: "select", options: divisions.map(d => ({ value: d.id, label: d.bn })) },
  { label: "জেলা", field: "district", type: "select", options: districts.map(d => ({ value: d.id, label: d.bn })) },
  { label: "উপজেলা", field: "sub_district", type: "select", options: subDistricts.map(sd => ({ value: sd.id, label: sd.bn })) },
  { label: "ইউনিয়ন", field: "union_name" },
  { label: "এতিম কিনা", field: "orphen_state", type: "select", options: [{ value: "1", label: "হ্যাঁ" }, { value: "0", label: "না" }] },
  { label: "স্ট্যাটাস", field: "status", type: "select", options: [
    { value: "active", label: "সক্রিয়" },
    { value: "inactive", label: "নিষ্ক্রিয়" },
    { value: "suspend", label: "স্থগিত" },
  ] },
  { label: "সেশন", field: "session", type: "select", options: sessions.map(s => ({ value: s.id, label: s.name })) },

  // ================= FINANCIAL =================
  { label: "আবাসিক কিনা", field: "abasik", type: "select", options: [{ value: "1", label: "হ্যাঁ" }, { value: "0", label: "না" }] },
  { label: "মাসিক বেতন", field: "monthlyBeton" },
  { label: "মাসিক গাড়িভাড়া", field: "monthlyGarivara" },
  { label: "খোরাকী", field: "khoraki" },
  { label: "বোর্ডিং স্ট্যাটাস", field: "bording_status", type: "select", options: [{ value: "1", label: "হ্যাঁ" }, { value: "0", label: "না" }] },
];


  // ================= RENDER =================
  return (
    <main className="main-container">
      <ToastContainer />
      <div style={styles.container}>
        <div style={styles.header}>
          <label htmlFor="picture">
        <div style={styles.photoBox}>
  {uploading ? (
    <div>Uploading...</div>
  ) : photoUrl() ? (
    <img src={`${BASE_URL}/${photoUrl()}`} style={styles.photo} />
  ) : (
    <div>No Photo</div>
  )}
</div>

          </label>
          <input
  type="file"
  id="picture"
  accept="image/*"
  style={{ display: "none" }}
  onChange={handlePhotoUpload}
/>
  <div style={{ flex: 1 }}>
            <h2>{student.name}</h2>
            <p>ID: {student.id}</p>
          </div>
        </div>

        <div style={styles.grid}>
          {fields.map(f => (
            <InfoField
              key={f.field}
              {...f}
              value={f.inputType === "date" ? formatDate(student[f.field]) : student[f.field]}
              editField={editField}
              onEdit={handleEditClick}
              onSave={handleSave}
              parseDate={parseDateForInput}
            />
          ))}
        </div>
      </div>
        <Section title="বেতন / ফি তথ্য">
      {fees1.length === 0 ? (
        <p>কোনো বেতন / ফি তথ্য পাওয়া যায়নি।</p>
      ) : (
        <FeeCardTable fees={fees1} />
      )}
    </Section>  
    </main>
  );
}

// ================= INFO FIELD =================
function InfoField({ label, field, value, editField, onEdit, onSave, type = "input", options = [], inputType = "text", parseDate }) {
  const [localValue, setLocalValue] = useState(value ?? "");
  useEffect(() => { setLocalValue(value ?? ""); }, [value]);
  const isDate = inputType === "date";

  return (
    <>
    <div style={styles.infoBox}>
      <label style={{ fontWeight: "bold", marginBottom: 5 }}>{label}</label>
      {editField === field ? (
        <>
          {type === "select" ? (
            <select
              value={String(localValue ?? "")}
              onChange={e => setLocalValue(e.target.value)}
              style={styles.input}
            >
              <option value="">-- নির্বাচন করুন --</option>
              {options.map(o => (
                <option key={o.value} value={String(o.value)}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : isDate ? (
            <>
              <input type="text" value={value} readOnly style={styles.input} />
              <input type="date" value={parseDate(localValue)} onChange={e => setLocalValue(e.target.value)} style={styles.input} />
            </>
          ) : (
            <input type={inputType} value={localValue} onChange={e => setLocalValue(e.target.value)} style={styles.input} />
          )}
          <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
            <button style={styles.btnSave} onClick={() => onSave(field, localValue)}>💾 Save</button>
            <button style={styles.btnCancel} onClick={() => onEdit(null)}>❌ Cancel</button>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            {type === "select" 
              ? options.find(o => String(o.value) === String(value))?.label || "-" 
              : value || "-"
            }
          </span>
          <button style={styles.btnEdit} onClick={() => onEdit(field)}>✏️ Edit</button>
        </div>
      )}
      
    </div>
    
  </>

  );
}
// ================= STYLES =================
const styles = {
  container: { maxWidth: 900, margin: 20, padding: 20, background: "#f9f9f9", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" },
  header: { display: "flex", gap: 20, marginBottom: 20, alignItems: "center" },
  photoBox: { width: 120, height: 120, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", background: "#eee" },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 },
  infoBox: { background: "#fff", padding: 12, borderRadius: 8, display: "flex", flexDirection: "column", gap: 5, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" },
  input: { padding: 8, borderRadius: 6, border: "1px solid #ccc", width: "100%", boxSizing: "border-box" },
  btnEdit: { cursor: "pointer", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", transition: "0.2s", fontWeight: "bold" },
  btnSave: { cursor: "pointer", background: "#00bfff", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontWeight: "bold", transition: "0.2s" },
  btnCancel: { cursor: "pointer", background: "#ff4d4f", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontWeight: "bold", transition: "0.2s" },
};