import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import Section from "../components/Section";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Buttons from "../components/buttons";

// -------------------------
// ✅ Teacher Dropdown with Checkboxes
// -------------------------
// -------------------------
// ✅ Teacher Dropdown with Checkboxes (Scrollable)
// -------------------------
function TeacherDropdown({ teachers, selected, setSelected }) {
  const [open, setOpen] = useState(false);

  const toggleTeacher = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn btn-view"
      >
        {selected.length > 0
          ? `${selected.length} শিক্ষক নির্বাচিত`
          : "শিক্ষক নির্বাচন করুন"}
      </button>

      {open && (
        <div
          className="absolute z-10 mt-1 w-full bg-white border rounded shadow"
          style={{
            maxHeight: "200px", // limit height
            overflowY: "auto",  // enable scroll
          }}
        >
          {teachers.map((t) => (
            <label
              key={t.puser}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(String(t.puser))}
                onChange={() => toggleTeacher(String(t.puser))}
                className="mr-2"
              />
              {t.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}


// -------------------------
// ✅ Main Component
// -------------------------
export default function KitabManagement() {
  const [kitabs, setKitabs] = useState([]);
  const [jamats, setJamats] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [currentKitab, setCurrentKitab] = useState({
    id: null,
    name: "",
    jamat: "",
    teacher: [],
  });

  const [loading, setLoading] = useState(false);
  const [filterJamat, setFilterJamat] = useState("");

  useEffect(() => {
    fetchKitabs();
    fetchJamats();
    fetchTeachers();
  }, []);

  // -------------------------
  // ✅ Fetch Kitabs (null-safe)
  // -------------------------
  const fetchKitabs = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/kitab");
      const formatted = data.map((k) => ({
        ...k,
        teacher: (() => {
          if (!k.teacher) return [];
          if (Array.isArray(k.teacher)) return k.teacher.map(String);
          try {
            return JSON.parse(k.teacher).map(String);
          } catch {
            return [];
          }
        })(),
      }));
      setKitabs(formatted);
    } catch {
      toast.error("কিতাব লোড করতে সমস্যা!");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await ApiManager.get("/teacher");
      setTeachers(data?.data || []);
    } catch {
      toast.error("শিক্ষক লোড করতে সমস্যা!");
    }
  };

  const fetchJamats = async () => {
    try {
      const data = await ApiManager.get("/jamat");
      setJamats(Array.isArray(data) ? data : []);
    } catch {
      toast.error("জামাত লোড করতে সমস্যা!");
    }
  };

  // -------------------------
  // ✅ Handlers
  // -------------------------
  const handleAdd = () => {
    setCurrentKitab({ id: null, name: "", jamat: "", teacher: [] });
    setShowModal(true);
  };

  const handleEdit = (kitab) => {
    setCurrentKitab({
      ...kitab,
      teacher: Array.isArray(kitab.teacher) ? kitab.teacher.map(String) : [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি সত্যিই এই কিতাব মুছে দিতে চান?")) return;
    try {
      await ApiManager.delete(`/kitab/${id}`);
      setKitabs(kitabs.filter((k) => k.id !== id));
      toast.success("কিতাব মুছে ফেলা হয়েছে!");
    } catch {
      toast.error("মুছে ফেলতে সমস্যা!");
    }
  };

  const handleSave = async () => {
    if (!currentKitab.name.trim() || !currentKitab.jamat) {
      toast.error("সব ফিল্ড পূরণ করুন!");
      return;
    }

    if (!currentKitab.teacher.length) {
      toast.warning("কমপক্ষে ১ জন শিক্ষক নির্বাচন করুন!");
      return;
    }

    try {
      const payload = {
        ...currentKitab,
        teacher: currentKitab.teacher.map(String),
      };

      if (currentKitab.id) {
        await ApiManager.put(`/kitab/${currentKitab.id}`, payload);
        toast.success("কিতাব আপডেট হয়েছে!");
      } else {
        await ApiManager.post("/kitab", payload);
        toast.success("নতুন কিতাব যুক্ত হয়েছে!");
      }

      fetchKitabs();
      setShowModal(false);
    } catch {
      toast.error("সংরক্ষণে সমস্যা!");
    }
  };

  // -------------------------
  // ✅ Filtered Kitabs
  // -------------------------
  const filteredKitabs = filterJamat
    ? kitabs.filter((k) => String(k.jamat) === String(filterJamat))
    : kitabs;

  // -------------------------
  // ✅ Table Columns
  // -------------------------
  const columns = [
    { key: "name", label: "কিতাবের নাম" },
    { key: "jamat", label: "জামাত" },
    { key: "teacher_names", label: "শিক্ষক" },
  ];

  const tableData = filteredKitabs.map((k) => {
    const teacherNames = teachers
      .filter(
        (t) => Array.isArray(k.teacher) && k.teacher.includes(String(t.puser))
      )
      .map((t) => t.name)
      .join(", ");

    return {
      id: k.id,
      name: k.name,
      jamat: jamats.find((j) => String(j.id) === String(k.jamat))?.name || "N/A",
      teacher_names: teacherNames || "N/A",
      action: (
        <>
          <Buttons type="edit" onClick={() => handleEdit(k)} />
           
          <Buttons type="delete" onClick={() => handleDelete(k.id)} />
          
        </>
      ),
    };
  });

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <Section title="কিতাব ম্যানেজমেন্ট">
        <div className="flex gap-3 mb-3">
          <button className="btn btn-add" onClick={handleAdd}>
            নতুন কিতাব যুক্ত করুন
          </button>

          <select
            value={filterJamat}
            onChange={(e) => setFilterJamat(e.target.value)}
          >
            <option value="">-- সব জামাত --</option>
            {jamats.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? <p>লোড হচ্ছে...</p> : <Table columns={columns} data={tableData} />}
      </Section>

      {showModal && (
    <ModalBox
  title={currentKitab.id ? "কিতাব সম্পাদনা করুন" : "নতুন কিতাব যুক্ত করুন"}
  onClose={() => setShowModal(false)}
>
  {/* Kitab Name */}
  <div className="modal-form-row">
    <label>কিতাবের নাম</label>
    <input
      type="text"
      value={currentKitab.name}
      onChange={(e) =>
        setCurrentKitab({ ...currentKitab, name: e.target.value })
      }
      placeholder="কিতাবের নাম লিখুন"
    />
  </div>

  {/* Jamat Select */}
  <div className="modal-form-row">
    <label>জামাত নির্বাচন</label>
    <select
      value={currentKitab.jamat}
      onChange={(e) =>
        setCurrentKitab({ ...currentKitab, jamat: e.target.value })
      }
    >
      <option value="">-- জামাত নির্বাচন করুন --</option>
      {jamats.map((j) => (
        <option key={j.id} value={j.id}>
          {j.name}
        </option>
      ))}
    </select>
  </div>

  {/* Teacher Dropdown (with multi-select/checkboxes) */}
  <div className="modal-form-row">
    <label>শিক্ষক</label>
    <TeacherDropdown
      teachers={teachers}
      selected={currentKitab.teacher}
      setSelected={(val) => setCurrentKitab({ ...currentKitab, teacher: val })}
    />
  </div>

  {/* Action Buttons */}
  <div className="modal-actions">
    <Buttons
      type="cancel"
      onClick={() => setShowModal(false)}
    />
     
    <Buttons type="save" onClick={handleSave} />
      
  </div>
</ModalBox>

      )}
    </main>
  );
}
