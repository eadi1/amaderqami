
import React, { useState, useEffect, useMemo, useRef } from "react";

import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";
import { Link } from "react-router-dom";

function ActiveStudents() {
  const isHydrated = useRef(false);
const getSavedFilters = () => {
  try {
    const saved = localStorage.getItem("activeStudentFilters");
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
};
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [jamats, setJamats] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [bivags, setBivags] = useState([]);

const savedFilters = getSavedFilters();

const [filterBivag, setFilterBivag] = useState(savedFilters?.filterBivag ?? "");
const [filterJamat, setFilterJamat] = useState(savedFilters?.filterJamat ?? "");
const [filterSession, setFilterSession] = useState(savedFilters?.filterSession ?? "");
const [searchId, setSearchId] = useState(savedFilters?.searchId ?? "");

  const BASE_URL = import.meta.env.VITE_API_URL || "";

  /* -------------------- TABLE COLUMNS -------------------- */
 
 const Columns = [
  { key: "id", label: "আইডি", visible: true },
 
  { key: "name", label: "শিক্ষার্থীর নাম", visible: true },
  { key: "jamat_name", label: "জামাতের নাম", visible: true },
   { key: "roll", label: "রোল নম্বর", visible: true },
  { key: "session_name", label: "শিক্ষাবর্ষ", visible: false },
  { key: "fatherName", label: "পিতার নাম", visible: true },
  { key: "motherName", label: "মাতার নাম", visible: false },
  { key: "address", label: "ঠিকানা", visible: true },
  { key: "phone", label: "মোবাইল নম্বর", visible: true },
  { key: "dob", label: "জন্ম তারিখ", visible: false },
  { key: "admissionDate", label: "ভর্তির তারিখ", visible: false },
  { key: "abasik", label: "আবাসিক অবস্থা", visible: false },
  { key: "monthlyBeton", label: "মাসিক বেতন", visible: false },
  { key: "monthlyGarivara", label: "মাসিক গাড়িভাড়া", visible: false },
  { key: "khoraki", label: "খোরাকি", visible: false },
  { key: "gurdiant_name", label: "অভিভাবকের নাম", visible: false },
  { key: "gurdiant_relation", label: "অভিভাবকের সম্পর্ক", visible: false },
  { key: "gurdiant_adress", label: "অভিভাবকের ঠিকানা", visible: false },
  { key: "photo", label: "ছবি", visible: false },
  { key: "birthCertificateNo", label: "জন্ম নিবন্ধন নম্বর", visible: false },
  { key: "nid", label: "এনআইডি নম্বর", visible: false },
  { key: "division", label: "বিভাগ", visible: false },
  { key: "district", label: "জেলা", visible: false },
  { key: "sub_district", label: "উপজেলা", visible: false },
  { key: "union_name", label: "ইউনিয়ন", visible: false },
  { key: "orphen_state", label: "এতিম অবস্থা", visible: false },
  { key: "bording_status", label: "বোর্ডিং অবস্থা", visible: false },



];

useEffect(() => {
  if (students.length) {
    setFilteredStudents(students);
  }
}, [students]);





  /* -------------------- INITIAL LOAD -------------------- */
useEffect(() => {
  fetchFilters();
  fetchActiveStudents();



  isHydrated.current = true; // ✅ hydration done
}, []);


  /* -------------------- APPLY FILTERS -------------------- */
 useEffect(() => {
  if (!isHydrated.current) return; // ⛔ prevent overwrite

  localStorage.setItem(
    "activeStudentFilters",
    JSON.stringify({
      filterBivag,
      filterJamat,
      filterSession,
      searchId
    })
  );
}, [filterBivag, filterJamat, filterSession, searchId]);

useEffect(() => {
  if (!students.length) return;
  if (filterBivag && !jamats.length) return;

  applyFilters();
}, [
  filterBivag,
  filterJamat,
  filterSession,
  searchId,
  students,
  jamats
]);


  /* -------------------- FETCH FILTER DATA -------------------- */
  const fetchFilters = async () => {
    try {
      const [jamatData, sessionData, bivagData] = await Promise.all([
        ApiManager.get("/jamat"),
        ApiManager.get("/session"),
        ApiManager.get("/bivag"),
      ]);
      setJamats(jamatData);
      setSessions(sessionData);
      setBivags(bivagData);
    } catch {
      toast.error("ফিল্টার ডেটা লোড করা যায়নি");
    }
  };

  /* -------------------- FETCH STUDENTS -------------------- */
  const fetchActiveStudents = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/student?status=active");
      setStudents(data);
    } catch {
      toast.error("শিক্ষার্থী লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- FILTER LOGIC -------------------- */
  const filteredJamats = useMemo(() => {
    if (!filterBivag) return jamats;
    return jamats.filter(j => String(j.division) === String(filterBivag));
  }, [filterBivag, jamats]);

 const applyFilters = () => {
  let temp = [...students];

  if (filterBivag) {
    const jamatIds = jamats
      .filter(j => String(j.division) === String(filterBivag))
      .map(j => String(j.id));

    temp = temp.filter(s => jamatIds.includes(String(s.jamat)));
  }

  if (filterJamat) {
    temp = temp.filter(s => String(s.jamat) === String(filterJamat));
  }

  if (filterSession) {
    temp = temp.filter(s => String(s.session) === String(filterSession));
  }

  if (searchId) {
    temp = temp.filter(s => s.id.toString() === searchId);
  }

  setFilteredStudents(temp);
};

const handlesuspend = async (id) => {
    if (!window.confirm("আপনি কি এই শিক্ষার্থীকে সাসপেন্ড করতে চান?")) return;
    try {
      await ApiManager.put(`/student/${id}/status`, { status: "suspend" });
      toast.success("Student is now suspended!");
      fetchActiveStudents();
    } catch (err) {
      toast.error("Status update failed!");
      console.error(err);
    }
  };

  /* -------------------- GROUP BY JAMAT + SORT BY ROLL -------------------- */
  const groupedStudents = useMemo(() => {
    const grouped = {};

    filteredStudents.forEach((s) => {
      if (!grouped[s.jamat]) grouped[s.jamat] = [];
      grouped[s.jamat].push(s);
    });

    Object.keys(grouped).forEach((jamatId) => {
      grouped[jamatId].sort((a, b) => Number(a.roll) - Number(b.roll));
    });

    return grouped;
  }, [filteredStudents]);

  /* -------------------- TABLE DATA -------------------- */
  const tableData = [];

  Object.keys(groupedStudents).forEach((jamatId) => {
 
    
    groupedStudents[jamatId].forEach((s) => {
      tableData.push({
        ...s,
        address: `${s.union_name}, ${s.sub_district_name}, ${s.district_name}`,
        photo: (
          <img
            src={`${BASE_URL}/${s.photo}`}
            alt={s.name}
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ),
        action: (<>
          <Link to={`/students/view/${s.id}`} className="btn btn-view">
            View
          </Link>
          <button
            onClick={() => handlesuspend(s.id)}
            style={{ marginLeft: 10 }}
            className="btn btn-delete"
          >
            Suspend
          </button  ></>
        ),
      });
    });
  });

  /* -------------------- UI -------------------- */
  return (
    <main className="main-container">
      <ToastContainer />
      <h2>সক্রিয় শিক্ষার্থী</h2>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <select value={filterBivag} onChange={e => {
          setFilterBivag(e.target.value);
          setFilterJamat("");
        }}>
          <option value="">সব বিভাগ</option>
          {bivags.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={filterJamat}
          onChange={e => setFilterJamat(e.target.value)}
        >
          <option value="">সব জামাত</option>
          {filteredJamats.map(j => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>

        <select
          value={filterSession}
          onChange={e => setFilterSession(e.target.value)}
        >
          <option value="">সব সেশন</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          placeholder="আইডি দিয়ে খুঁজুন"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        <Table columns={Columns} data={tableData} />
      )}
    </main>
  );
}

export default ActiveStudents;
