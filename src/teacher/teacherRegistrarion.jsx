import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { useNavigate } from "react-router-dom";

export default function TeacherForm({ teacherId }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4; // এখন 4 step, experiences + educations
  const navigate = useNavigate();
function dateformat(date) {
  if (!date) return ""; // prevent invalid date crash
  const d = new Date(date);
  if (isNaN(d)) return ""; // still invalid → return empty
  return d.toISOString().slice(0, 10);
}

  // DOB arrays
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: "01", name: "January" },
    { value: "02", name: "February" },
    { value: "03", name: "March" },
    { value: "04", name: "April" },
    { value: "05", name: "May" },
    { value: "06", name: "June" },
    { value: "07", name: "July" },
    { value: "08", name: "August" },
    { value: "09", name: "September" },
    { value: "10", name: "October" },
    { value: "11", name: "November" },
    { value: "12", name: "December" },
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  // DOB dropdown states
  const [dobYear, setDobYear] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    bangla_name: "",
    father_name: "",
    mother_name: "",
    gender: "",
    dob: "",
    nid: "",
    email: "",
    phone: "",
    alt_phone: "",
    present_address: "",
    permanent_address: "",
    joining_date: "",
    designation: "",
    department: "",
    qualification: "",
    experience: "",
    salary: "",
    bank_account: "",
    status: "Active",
    experiences: [{ company: "", position: "", duration: "" }],
    educations: [{ degree: "", institute: "", year: "" }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

useEffect(() => {
  if (!teacherId) return;
  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const res = await ApiManager.get(`/teacher/${teacherId}`);
      const data = res.data;

      // Ensure experiences & educations are arrays
      const experiences = Array.isArray(data.experiences)
        ? data.experiences
        : data.experiences
          ? JSON.parse(data.experiences)
          : [{ company: "", position: "", duration: "" }];

      const educations = Array.isArray(data.educations)
        ? data.educations
        : data.educations
          ? JSON.parse(data.educations)
          : [{ degree: "", institute: "", year: "" }];

      // Set DOB
      if (data.dob) {
        const [y, m, d] = dateformat(data.dob).split("-");
        setDobYear(y);
        setDobMonth(m);
        setDobDay(d);
      }

      setFormData({
        ...formData,
        ...data,
        experiences,
        educations,
      });
    } catch (err) {
      setError("শিক্ষক তথ্য লোড করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };
  fetchTeacher();
  // eslint-disable-next-line
}, [teacherId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExp = [...formData.experiences];
    newExp[index][field] = value;
    setFormData((prev) => ({ ...prev, experiences: newExp }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEdu = [...formData.educations];
    newEdu[index][field] = value;
    setFormData((prev) => ({ ...prev, educations: newEdu }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { company: "", position: "", duration: "" }],
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educations: [...prev.educations, { degree: "", institute: "", year: "" }],
    }));
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const finalDob = `${dobYear}-${dobMonth}-${dobDay}`;
      const dataToSend = { ...formData, dob: finalDob };
      if (teacherId) await ApiManager.put(`/teacher/${teacherId}`, dataToSend);
      else await ApiManager.post("/teacher", dataToSend);
      navigate("/teachers");
    } catch (err) {
      setError("সংরক্ষণে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container">
      <div className="admission-form-container">
        <h1>{teacherId ? "শিক্ষক সম্পাদনা" : "নতুন শিক্ষক যোগ"}</h1>
        {error && <p className="text-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="form-card">
              <h2>ব্যক্তিগত তথ্য</h2>
              <div className="form-row">
                <div className="field">
                  <label>ইংরেজি নাম</label>
                  <input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>বাংলা নাম</label>
                  <input name="bangla_name" value={formData.bangla_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>পিতার নাম</label>
                  <input name="father_name" value={formData.father_name} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>মাতার নাম</label>
                  <input name="mother_name" value={formData.mother_name} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>লিঙ্গ</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">লিঙ্গ নির্বাচন করুন</option>
                    <option value="Male">পুরুষ</option>
                    <option value="Female">নারী</option>
                    <option value="Other">অন্যান্য</option>
                  </select>
                </div>
                <div className="field">
                  <label>জন্ম তারিখ</label>
                  <div className="dob-group">
                    <div className="dob-day-field">
                      <label>দিন</label>
                      <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} required>
                        <option value="">দিন</option>
                        {days.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="dob-month-field">
                      <label>মাস</label>
                      <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} required>
                        <option value="">মাস</option>
                        {months.map((m) => (
                          <option key={m.value} value={m.value}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="dob-year-field">
                      <label>বছর</label>
                      <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} required>
                        <option value="">বছর</option>
                        {years.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Contact Info */}
          {step === 2 && (
            <div className="form-card">
              <h2>যোগাযোগ তথ্য</h2>
              <div className="form-row">
                <div className="field"><label>ফোন</label><input name="phone" value={formData.phone} onChange={handleChange} /></div>
                <div className="field"><label>বিকল্প ফোন</label><input name="alt_phone" value={formData.alt_phone} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>ইমেইল</label><input name="email" value={formData.email} onChange={handleChange} /></div>
                <div className="field"><label>NID</label><input name="nid" value={formData.nid} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>বর্তমান ঠিকানা</label><textarea name="present_address" value={formData.present_address} onChange={handleChange} /></div>
                <div className="field"><label>স্থায়ী ঠিকানা</label><textarea name="permanent_address" value={formData.permanent_address} onChange={handleChange} /></div>
              </div>
            </div>
          )}

          {/* STEP 3: Job Info */}
          {step === 3 && (
            <div className="form-card">
              <h2>কর্মসংস্থান তথ্য</h2>
              <div className="form-row">
                <div className="field"><label>Joining Date 
                  </label><input type="date" name="joining_date" value={dateformat(formData.joining_date)} onChange={handleChange} /></div>
                <div className="field"><label>Designation</label><input name="designation" value={formData.designation} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Department</label><input name="department" value={formData.department} onChange={handleChange} /></div>
                <div className="field"><label>Qualification</label><input name="qualification" value={formData.qualification} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Experience (Years)</label><input name="experience" value={formData.experience} onChange={handleChange} /></div>
                <div className="field"><label>Salary</label><input type="number" name="salary" value={formData.salary} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Bank Account</label><input name="bank_account" value={formData.bank_account} onChange={handleChange} /></div>
              </div>
            </div>
          )}

          {/* STEP 4: Experience & Education */}
          {step === 4 && (
            <div className="form-card">
              <h2>অভিজ্ঞতা ও শিক্ষাগত যোগ্যতা</h2>

              <h3>Experiences</h3>
              {formData.experiences.map((exp, idx) => (
                <div className="form-row" key={idx}>
                  <div className="field"><label>Company</label><input value={exp.company} onChange={(e)=>handleExperienceChange(idx,'company',e.target.value)} /></div>
                  <div className="field"><label>Position</label><input value={exp.position} onChange={(e)=>handleExperienceChange(idx,'position',e.target.value)} /></div>
                  <div className="field"><label>Duration</label><input value={exp.duration} onChange={(e)=>handleExperienceChange(idx,'duration',e.target.value)} /></div>
                </div>
              ))}
              <button type="button" className="btn btn-add" onClick={addExperience}>Add Experience</button>

              <h3>Educations</h3>
              {formData.educations.map((edu, idx) => (
                <div className="form-row" key={idx}>
                  <div className="field"><label>Degree</label><input value={edu.degree} onChange={(e)=>handleEducationChange(idx,'degree',e.target.value)} /></div>
                  <div className="field"><label>Institute</label><input value={edu.institute} onChange={(e)=>handleEducationChange(idx,'institute',e.target.value)} /></div>
                  <div className="field"><label>Year</label><input value={edu.year} onChange={(e)=>handleEducationChange(idx,'year',e.target.value)} /></div>
                </div>
              ))}
              <button type="button" className="btn btn-add"  onClick={addEducation}>Add Education</button>
            </div>
          )}

          {/* Buttons */}
          <div className="form-navigation">
            {step > 1 && <button type="button" className="btn btn-view" onClick={handlePrev}>◀ পূর্ববর্তী</button>}
            {step < totalSteps && <button type="button" className="btn btn-edit-recurring" onClick={handleNext}>পরবর্তী ▶</button>}
            {step === totalSteps && <button className="btn btn-approve" type="submit">{loading ? "সংরক্ষণ হচ্ছে..." : "সাবমিট"}</button>}
          </div>
        </form>

        <div className="progress-bar">ধাপ {step} / {totalSteps}</div>
      </div>
    </main>
  );
}
