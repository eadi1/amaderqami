import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ApiManager from "../apimanger";


export default function TeacherView() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
const dateformat = (dateStr) => {
  const formattedDate = new Date(dateStr).toISOString().split("T")[0];
  return formattedDate;
};
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await ApiManager.get(`/teacher/${id}`);
        if (res.success) setTeacher(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeacher();
  }, [id]);

  if (!teacher) return <div className="loading">Loading...</div>;

  const educations = teacher.educations || [];
  const experiences = teacher.experiences || [];

  return (
    <main className="main-container ">
<main className="cv-container" style={{ display: 'flex', flexWrap: 'wrap',gap: '20px', justifyContent: 'center' }}>

      {/* Header */}
      <div className="cv-header">
        <div className="cv-profile">
           {teacher.photo ? (
  <img 
    src={teacher.photo} 
    alt="Teacher" 
    className="teacher-photo" 
    style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
  />
) : (
  <div 
    className="cv-placeholder-image" 
    style={{ 
      width: '150px', 
      height: '150px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#e0e0e0', 
      borderRadius: '8px', 
      color: '#555', 
      fontWeight: 'bold' 
    }}
  >
    No Image
  </div>
)}

         
          <div className="cv-profile-info">
            <h1>{teacher.name}</h1>
            <p>{teacher.designation}</p>
            <p>{teacher.department}</p>
          </div>
        </div>
        <Link to="/teachers" className="btn btn-back">Back</Link>
      </div>

      {/* Cards Row */}
      <div className="cv-cards">
        {/* Personal Info */}
        <div className="cv-card">
          <h2>Personal Information</h2>
          <div className="cv-info">
            {[
              ["Bangla Name", teacher.bangla_name],
              ["Father's Name", teacher.father_name],
              ["Mother's Name", teacher.mother_name],
              ["Gender", teacher.gender],
              ["Date of Birth", dateformat(teacher.dob)],
              ["NID", teacher.nid],
              ["Phone", teacher.phone],
              ["Alt Phone", teacher.alt_phone || "—"],
              ["Email", teacher.email]
            ].map(([label, value], idx) => (
              <div key={idx} className="cv-row">
                <span className="cv-label">{label}</span>
                <span className="cv-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Job Info */}
        <div className="cv-card">
          <h2>Address & Job Info</h2>
          <div className="cv-info">
            <div className="cv-row">
              <span className="cv-label">Present Address</span>
              <span className="cv-value">{teacher.present_address}</span>
            </div>
            <div className="cv-row">
              <span className="cv-label">Permanent Address</span>
              <span className="cv-value">{teacher.permanent_address}</span>
            </div>
            <div className="cv-row">
              <span className="cv-label">Joining Date</span>
              <span className="cv-value">{dateformat(teacher.joining_date)}</span>
            </div>
            <div className="cv-row">
              <span className="cv-label">Department</span>
              <span className="cv-value">{teacher.department}</span>
            </div>
            <div className="cv-row">
              <span className="cv-label">Salary</span>
              <span className="cv-value">{teacher.salary} ৳</span>
            </div>
            <div className="cv-row">
              <span className="cv-label">Bank Account</span>
              <span className="cv-value">{teacher.bank_account}</span>
            </div>
            <div className="cv-row">
              <span className="cv-label">Status</span>
              <span className="cv-value">{teacher.status}</span>
            </div>
          </div>
        </div>

        {/* Educational Qualifications */}
        <div className="cv-card">
          <h2>Educational Qualifications</h2>
          <table className="cv-table">
            <thead>
              <tr>
                <th>Degree</th>
                <th>Institute</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              {educations.length > 0 ? (
                educations.map((edu, idx) => (
                  <tr key={idx}>
                    <td>{edu.degree}</td>
                    <td>{edu.institute}</td>
                    <td>{edu.year}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Work Experience */}
        <div className="cv-card">
          <h2>Work Experience</h2>
          <table className="cv-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Position</th>
                <th>Duration (Years)</th>
              </tr>
            </thead>
            <tbody>
              {experiences.length > 0 ? (
                experiences.map((exp, idx) => (
                  <tr key={idx}>
                    <td>{exp.company}</td>
                    <td>{exp.position}</td>
                    <td>{exp.duration}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
    </main>
  );
}
