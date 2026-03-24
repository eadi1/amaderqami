import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OldAdmissionForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 6; // Number of form cards
const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id:"",
    name: "",
    fatherName: "",
    motherName: "",
    address: "",
    phone: "",
    dob: "",
    jamat: "",
    roll: "",
    session: "",
    admissionDate: "",
    leavingDate: "",
    email: "",
    guardianPhone: "",
    birthCertificateNo: "",
    nid: "",
    division: "",
    district: "",
    sub_district: "",
    union_name: "",
    abasik: false,
    monthlyBeton: "",
    monthlyGarivara: "",
    khoraki: "",
    gurdiant_name: "",
    gurdiant_relation: "",
    gurdiant_adress: "",
    orphen_state: false,
    status: "active",
    photo: null,
  });

  const [loading, setLoading] = useState(false);
  const [jamatOptions, setJamatOptions] = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const formatDateForServer = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const jamatRes = await ApiManager.get("/jamat");
        setJamatOptions(jamatRes || []);
        const sessionRes = await ApiManager.get("/session");
        setSessionOptions(sessionRes || []);
      } catch (err) {
        alert("জামাত/সেশন আনতে সমস্যা হয়েছে");
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
 useEffect(() => {
  const fetchStudent = async () => {
    if (!formData.id) return; // Don't fetch if no ID
    setLoading(true);
    try {
      // GET request to fetch student
      const res = await ApiManager.get(`/student/${formData.id}`);

      if (res && res.id) {
        // Normalize the data for form
        setFormData((prev) => ({
          ...prev,
          ...res,
          abasik: res.abasik === "Abasik" || res.abasik === "1",
          orphen_state: res.orphen_state === "1",
          photo: res.photo ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${res.photo.replace(/\\/g, "/")}` : `${import.meta.env.VITE_API_BASE_URL}/uploads/avata.jpg`,
        }));
       // setStep(2); // Move to next step automatically
      } else {
        toast.error("শিক্ষার্থীর তথ্য পাওয়া যায়নি!");
      }
    } catch (err) {
      console.error("Failed to fetch student:", err);
     toast.error("entry correct id")
    } finally {
      setLoading(false);
    }
  };

  fetchStudent();
}, [formData.id]);




  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const data = new FormData();

    // ✅ Normalize boolean and date fields
    const normalizedData = {
      ...formData,
      abasik: formData.abasik ? "1" : "0",
      orphenState: formData.orphenState ? "1" : "0",
      dob: formatDateForServer(formData.dob),
      admissionDate: formatDateForServer(formData.admissionDate),
    };

    // ✅ Append fields properly (don't convert File to string)
    Object.entries(normalizedData).forEach(([key, value]) => {
      if (key === "photo" && value instanceof File) {
        data.append("photo", value);
      } else {
        data.append(key, value ?? "");
      }
    });

    // ✅ Send POST request (true means multipart form)
    const response = await ApiManager.post("/student/oldstudent", data, true);

    if (response && (response.id || response.student)) {
      // Adjust based on backend response structure
      const studentData = response.student || response;

      // ✅ Navigate to admission PDF page
      navigate(`/admission_pdf/${studentData.id}`);
    } else {
      throw new Error("সার্ভার থেকে তথ্য পাওয়া যায়নি!");
    }
  } catch (err) {
    console.error("Form submission error:", err);
    setError(err.message || "কিছু সমস্যা হয়েছে!");
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="main-container">
      <div className="admission-form-container">
        <h1>পুরাতন শিক্ষার্থী ভর্তি ফর্ম</h1>
        {error && <p className="text-error">{error}</p>}
        {success && <p className="text-success">{success}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* ---------- STEP 1: ব্যক্তিগত তথ্য ---------- */}
                  {step === 1 && (
            <div className="form-card">
              <h2>ব্যক্তিগত তথ্য</h2>
              <div className="form-row">
              <input name="id" value={formData.id} onChange={handleChange} placeholder="স্টুডেন্ট আইডি " required />
               </div>
            
            </div>
          )}

          {step === 2 && (
            <div className="form-card">
              <h2>ব্যক্তিগত তথ্য</h2>
              <div className="form-row">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="নাম" required />
                <input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="পিতার নাম" required />
                <input name="motherName" value={formData.motherName} onChange={handleChange} placeholder="মাতার নাম" required />
              </div>
              <div className="form-row">
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="ফোন" required />
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
              </div>
            </div>
          )}

          {/* ---------- STEP 2: একাডেমিক তথ্য ---------- */}
          {step === 3 && (
            <div className="form-card">
              <h2>একাডেমিক তথ্য</h2>
              <div className="form-row">
                <select name="jamat" value={formData.jamat} onChange={handleChange} required>
                  <option value="">জামাত নির্বাচন করুন</option>
                  {jamatOptions.map((j) => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
                <input name="roll" value={formData.roll} onChange={handleChange} placeholder="রোল নম্বর" required />
                <select name="session" value={formData.session} onChange={handleChange} required>
                  <option value="">সেশন নির্বাচন করুন</option>
                  {sessionOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ---------- STEP 3: ফি তথ্য ---------- */}
          {step === 4 && (
            <div className="form-card">
              <h2>ফি তথ্য</h2>
              <div className="form-row">
                <input type="number" name="monthlyBeton" value={formData.monthlyBeton} onChange={handleChange} placeholder="মাসিক বেতন" />
                <input type="number" name="monthlyGarivara" value={formData.monthlyGarivara} onChange={handleChange} placeholder="মাসিক গাড়িভাড়া" />
                <input type="number" name="khoraki" value={formData.khoraki} onChange={handleChange} placeholder="খোরাকী" />
              </div>
              <div className="form-row">
                <label>
                  <input type="checkbox" name="orphen_state" checked={formData.orphen_state} onChange={handleChange} />
                  এতিম
                </label>
                <label>
                  <input type="checkbox" name="abasik" checked={formData.abasik} onChange={handleChange} />
                  আবাসিক
                </label>
              </div>
            </div>
          )}

          {/* ---------- STEP 4: ঠিকানা তথ্য ---------- */}
          {step === 5 && (
            <div className="form-card">
              <h2>ঠিকানা তথ্য</h2>
              <div className="form-row">
                <input name="division" value={formData.division} onChange={handleChange} placeholder="বিভাগ" />
                <input name="district" value={formData.district} onChange={handleChange} placeholder="জেলা" />
                <input name="sub_district" value={formData.sub_district} onChange={handleChange} placeholder="উপজেলা" />
                <input name="union_name" value={formData.union_name} onChange={handleChange} placeholder="ইউনিয়ন" />
              </div>
            </div>
          )}

          {/* ---------- STEP 5: অভিভাবক ও অন্যান্য ---------- */}
          {step === 6 && (
            <div className="form-card">
              <h2>অভিভাবক ও অন্যান্য তথ্য</h2>
              <div className="form-row">
                <input name="gurdiant_name" value={formData.gurdiant_name} onChange={handleChange} placeholder="অভিভাবকের নাম" />
                <input name="gurdiant_relation" value={formData.gurdiant_relation} onChange={handleChange} placeholder="সম্পর্ক" />
                <input name="gurdiant_adress" value={formData.gurdiant_adress} onChange={handleChange} placeholder="ঠিকানা" />
                <input name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} placeholder="ফোন" />
              </div>
             <div className="form-group">
  <label>ছবি</label>
  <input type="file" name="photo" accept="image/*" onChange={handleChange} />
  {formData.photo && (
    <img
      src={typeof formData.photo === "string" ? formData.photo : URL.createObjectURL(formData.photo)}
      alt="preview"
      className="image-preview"
    />
  )}
</div>

              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
                <option value="suspend">স্থগিত</option>
              </select>
            </div>
          )}

          {/* ---------- Navigation Buttons ---------- */}
          <div className="form-navigation">
            {step > 1 && (
              <button type="button" onClick={handlePrev} className="btn-prev">
                ◀ পূর্ববর্তী
              </button>
            )}
            {step < totalSteps && (
              <button type="button" onClick={handleNext} className="btn-next">
                পরবর্তী ▶
              </button>
            )}
            {step === totalSteps && (
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "সংরক্ষণ হচ্ছে..." : "সাবমিট"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 🔹 Progress Indicator */}
      <div className="progress-bar">
        ধাপ {step} / {totalSteps}
      </div>
    </main>
  );
}
