import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiManager from "../apimanger";
import DivsionComponent from "../components/divsion";
import DistrictComponent from "../components/district";
import UpozilaComponent from "../components/upazila";
import BivagComponent from "../components/bivag";
import JamatComponent from "../components/jamat";

export default function NewAdmissionForm() {
  const navigate = useNavigate();
  const totalSteps = 5;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
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
    subDistrict: "",
    unionName: "",
    abasik: false,
    monthlyBeton: "",
    monthlyGarivara: "",
    khoraki: "",
    gurdiantName: "",
    gurdiantRelation: "",
    gurdiantAdress: "",
    orphenState: false,
    status: "active",
    photo: null,
    bivag: "",
    bordingStatus:false
  });

  const [jamatOptions, setJamatOptions] = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");

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
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.name && formData.fatherName && formData.motherName && formData.phone && formData.dob;
      case 2:
        return formData.division && formData.district && formData.subDistrict;
      case 3:
        return formData.gurdiantName && formData.gurdiantRelation && formData.gurdiantAdress;
      case 4:
        return formData.bivag && formData.jamat && formData.roll && formData.session;
      case 5:
        return true; // optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      setError("অনুগ্রহ করে সব বাধ্যতামূলক তথ্য পূরণ করুন");
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const formatDateForServer = (dateStr) => (dateStr ? dateStr : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();

     const normalizedData = {
  ...formData,

  abasik: formData.abasik ? "1" : "0",
  orphenState: formData.orphenState ? "1" : "0",

  bordingStatus: formData.bordingStatus ? "1" : "0", // ✅ ADD THIS

  dob: formatDateForServer(formData.dob),
  admissionDate: formatDateForServer(formData.admissionDate),
  leavingDate: formatDateForServer(formData.leavingDate),

  roll: formData.roll ? parseInt(formData.roll) : null,
  monthlyBeton: formData.monthlyBeton ? parseFloat(formData.monthlyBeton) : 0,
  monthlyGarivara: formData.monthlyGarivara ? parseFloat(formData.monthlyGarivara) : 0,
  khoraki: formData.khoraki ? parseFloat(formData.khoraki) : 0,

  session: formData.session ? parseInt(formData.session) : null,

  name: formData.name || null,
  fatherName: formData.fatherName || null,
  motherName: formData.motherName || null,
  address: formData.address || null,
  phone: formData.phone || null,
  email: formData.email || null,
  guardianPhone: formData.guardianPhone || null,
  birthCertificateNo: formData.birthCertificateNo || null,
  nid: formData.nid || null,

  division: formData.division || null,
  district: formData.district || null,
  subDistrict: formData.subDistrict || null,
  unionName: formData.unionName || null,

  bivag: formData.bivag || null,
  jamat: formData.jamat || null,

  gurdiantName: formData.gurdiantName || null,
  gurdiantRelation: formData.gurdiantRelation || null,
  gurdiantAdress: formData.gurdiantAdress || null,

  status: formData.status || "active",
};


      Object.entries(normalizedData).forEach(([key, value]) => {
        if (key === "photo" && value instanceof File) {
          data.append("photo", value);
        } else {
          data.append(key, value);
        }
      });

      const response = await ApiManager.post("/student", data, true);

      if (response && (response.id || response.student)) {
        const studentData = response.student || response;
        setSuccess("শিক্ষার্থী সফলভাবে যোগ হয়েছে!");
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
        <h1>নতুন শিক্ষার্থী ভর্তি ফর্ম</h1>
        {error && <p className="text-error " style={{
          color:"red",
          fontWeight:"bolder"
        }}>{error}</p>}
        {success && <p className="text-success">{success}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
  {/* ---------- STEP 1: ব্যক্তিগত তথ্য ---------- */}
  {step === 1 && (
    <div className="form-card">
      <h2>ব্যক্তিগত তথ্য</h2>
      <div className="form-row">
        <div className="field">
          <label>শিক্ষার্থীর নাম</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="শিক্ষার্থীর নাম লিখুন" required />
        </div>
        <div className="field">
          <label>পিতার নাম</label>
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="পিতার নাম লিখুন" required />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>মাতার নাম</label>
          <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="মাতার নাম লিখুন" required />
        </div>
        <div className="field">
          <label>ফোন নম্বর (ইংরেজি)</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="ফোন নম্বর লিখুন" required />
        </div>
        <div className="field">
          <label>জন্মনিবন্ধন নম্বর</label>
          <input type="number" name="nid" value={formData.nid} onChange={handleChange} placeholder="জন্মনিবন্ধন নম্বর লিখুন" required />
        </div>
        <div className="field">
          <label>জন্ম তারিখ</label>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
        </div>
      </div>
    </div>
  )}

  {/* ---------- STEP 2: ঠিকানা তথ্য ---------- */}
  {step === 2 && (
    <div className="form-card">
      <h2>ঠিকানা তথ্য</h2>
      <div className="form-row">
        <div className="field">
          <label>বিভাগ</label>
          <DivsionComponent
            value={formData.division}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, division: value, district: "", subDistrict: "" }));
              setDivision(value);
              setDistrict("");
            }}
          />
        </div>
        <div className="field">
          <label>জেলা</label>
          <DistrictComponent
            divisionId={division}
            value={formData.district}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, district: value, subDistrict: "" }));
              setDistrict(value);
            }}
          />
        </div>
        <div className="field">
          <label>উপজেলা/থানা</label>
          <UpozilaComponent
            districtId={district}
            value={formData.subDistrict}
            onChange={(value) => setFormData((prev) => ({ ...prev, subDistrict: value }))}
          />
        </div>
      
        <div className="field">
          <label>ইউনিয়ন/গ্রাম/পাড়া/মহল্লা</label>
          <input type="text" name="unionName" value={formData.unionName} onChange={handleChange} placeholder="ইউনিয়নের নাম লিখুন" />
        </div>
      </div>
    </div>
  )}

  {/* ---------- STEP 3: অভিভাবক তথ্য ---------- */}
  {step === 3 && (
    <div className="form-card">
      <h2>অভিভাবক ও অন্যান্য তথ্য</h2>
      <div className="form-row">
        <div className="field">
          <label>অভিভাবকের নাম</label>
          <input type="text" name="gurdiantName" value={formData.gurdiantName} onChange={handleChange} placeholder="অভিভাবকের নাম লিখুন" required />
        </div>
        <div className="field">
          <label>সম্পর্ক</label>
          <input type="text" name="gurdiantRelation" value={formData.gurdiantRelation} onChange={handleChange} placeholder="সম্পর্ক লিখুন" required />
        </div>
        <div className="field">
          <label>ঠিকানা</label>
          <input type="text" name="gurdiantAdress" value={formData.gurdiantAdress} onChange={handleChange} placeholder="ঠিকানা লিখুন" required />
        </div>
        <div className="field">
          <label>ফোন  (ইংরেজি)</label>
          <input type="hidden" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} placeholder="ফোন নম্বর লিখুন"  />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>ছবি নির্বাচন করুন</label>
          <input type="file" name="photo" accept="image/*" onChange={handleChange} />
          {formData.photo && <img src={URL.createObjectURL(formData.photo)} alt="preview" className="image-preview" />}
        </div>
        <div className="field">
          <label>স্ট্যাটাস</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">সক্রিয়</option>
            <option value="inactive">নিষ্ক্রিয়</option>
            <option value="suspend">স্থগিত</option>
          </select>
        </div>
      </div>
    </div>
  )}

  {/* ---------- STEP 4: একাডেমিক তথ্য ---------- */}
  {step === 4 && (
    <div className="form-card">
      <h2>একাডেমিক তথ্য</h2>
      <div className="form-row">
        <div className="field">
          <label>বিভাগ</label>
          <BivagComponent
            value={formData.bivag}
            onChange={(value) => setFormData((prev) => ({ ...prev, bivag: value, jamat: "" }))}
          />
        </div>
        <div className="field">
          <label>জামাত</label>
          <JamatComponent
            divisionId={formData.bivag}
            value={formData.jamat}
            onChange={(value) => setFormData((prev) => ({ ...prev, jamat: value }))}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>রোল নম্বর  (ইংরেজি)</label>
          <input type="number" name="roll" value={formData.roll} onChange={handleChange} placeholder="রোল লিখুন" required />
        </div>
        <div className="field">
          <label>সেশন</label>
          <select name="session" value={formData.session} onChange={handleChange} required>
            <option value="">সেশন নির্বাচন করুন</option>
            {sessionOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )}

  {/* ---------- STEP 5: ফি তথ্য ---------- */}
  {step === 5 && (
    <div className="form-card">
      <h2>ফি তথ্য</h2>
      <div className="form-row">
        <div className="field">
          <label>মাসিক বেতন  (ইংরেজি)</label>
          <input type="number" name="monthlyBeton" value={formData.monthlyBeton} onChange={handleChange} placeholder="মাসিক বেতন লিখুন" />
        </div>
        <div className="field">
          <label>মাসিক গাড়িভাড়া  (ইংরেজি)</label>
          <input type="number" name="monthlyGarivara" value={formData.monthlyGarivara} onChange={handleChange} placeholder="মাসিক গাড়িভাড়া লিখুন" />
        </div>
        <div className="field">
          <label>খোরাকী  (ইংরেজি)</label>
          <input type="number" name="khoraki" value={formData.khoraki} onChange={handleChange} placeholder="খোরাকী লিখুন" />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>
            <input type="checkbox" name="orphenState" checked={formData.orphenState} onChange={handleChange} /> এতিম
          </label>
        </div>
        <div className="field">
          <label>
            <input type="checkbox" name="abasik" checked={formData.abasik} onChange={handleChange} /> আবাসিক
          </label>
        </div>
        <div className="field">
  <label>
    <input
      type="checkbox"
      name="bordingStatus"
      checked={formData.bordingStatus}
      onChange={handleChange}
    />
    বোর্ডিং শিক্ষার্থী
  </label>
</div>

      </div>
    </div>
  )}

  <div className="form-navigation">
    {step > 1 && <button className="btn btn-view" type="button" onClick={handlePrev}>◀ পূর্ববর্তী</button>}
    {step < totalSteps && <button className="btn btn-view-details" type="button" onClick={handleNext}>পরবর্তী ▶</button>}
    {step === totalSteps && <button className="btn btn-add" type="submit" disabled={loading}>{loading ? "সংরক্ষণ হচ্ছে..." : "সাবমিট"}</button>}
  </div>
</form>

      </div>
      <div className="progress-bar">ধাপ {step} / {totalSteps}</div>
    </main>
  );
}
