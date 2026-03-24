import React, { useEffect, useState } from "react";
import ApiManager from "../apimanger";
import { toast } from "react-toastify";
import Table from "../components/Table";
import ModelBox from "../components/modelbox";

export default function TeacherHomeWork() {
  const [homeworks, setHomeWork] = useState([]);
  const [kitabs, setKitab] = useState([]);
  const [jamats, setJamats] = useState([]);
  const [sheetNumbers, setSheetNumer] = useState([]);
  const [showModel, setShowmodel] = useState(false);

  // For Add & Edit
  const [editId, setEditId] = useState(null);
const formatBanglaDate = (isoDate) => {
  if (!isoDate) return "";

  const date = new Date(isoDate);

  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

  const [currentHw, setCurrentHw] = useState({
    sheet_number: "",
    subject_id: "",
    class_id: "",
    description: "",
  });

  useEffect(() => {
    fetchSheets();
    fetchKitabs();
    fetchJamats();
    fetchHomeWork();
  }, []);

  const fetchSheets = async () => {
    try {
      const data = await ApiManager.get("/sheetnumber");
      setSheetNumer(data);
    } catch {
      toast.error("সীট নাম্বার লোড করতে সমস্যা!");
    }
  };

  const fetchKitabs = async () => {
    try {
      const data = await ApiManager.get("/kitab");
      setKitab(data);
    } catch {
      toast.error("কিতাব লোড করতে সমস্যা!");
    }
  };

  const fetchJamats = async () => {
    try {
      const data = await ApiManager.get("/jamat");
      setJamats(data);
    } catch {
      toast.error("জামাত লোড করতে সমস্যা!");
    }
  };

  const fetchHomeWork = async () => {
    try {
      const data = await ApiManager.get("/homework");
      setHomeWork(data);
    } catch {
      toast.error("হোমওয়ার্ক লোড করতে সমস্যা!");
    }
  };

  // **************************************
  // 🔥 Add OR Update Homework 
  // **************************************
  const saveHomework = async () => {
    if (
      !currentHw.sheet_number ||
      !currentHw.subject_id ||
      !currentHw.class_id ||
      !currentHw.description
    ) {
      toast.error("সব ঘর পূরণ করুন!");
      return;
    }

    try {
      if (editId === null) {
        // ---- ADD ----
        await ApiManager.post("/homework", currentHw);
        toast.success("হোমওয়ার্ক যোগ হয়েছে!");
      } else {
        // ---- UPDATE ----
        await ApiManager.put(`/homework/${editId}`, currentHw);
        toast.success("হোমওয়ার্ক আপডেট হয়েছে!");
      }

      setShowmodel(false);
      fetchHomeWork();

      setCurrentHw({
        sheet_number: "",
        subject_id: "",
        class_id: "",
        description: "",
      });

      setEditId(null);

    } catch {
      toast.error("হোমওয়ার্ক সংরক্ষণে সমস্যা!");
    }
  };

  // **************************************
  // ✏️ Load Homework for Editing
  // **************************************
  const editHomework = (hw) => {
    setEditId(hw.id);

    setCurrentHw({
      sheet_number: hw.sheet_id,
      subject_id: hw.subject_id,
      class_id: hw.class_id,
      description: hw.description,
    });

    setShowmodel(true);
  };

  // **************************************
  // ❌ Delete Homework
  // **************************************
  const deleteHomework = async (id) => {
    if (!window.confirm("আপনি কি ডিলিট করতে চান?")) return;

    try {
      await ApiManager.delete(`/homework/${id}`);
      toast.success("ডিলিট হয়েছে!");
      fetchHomeWork();
    } catch {
      toast.error("ডিলিট করতে সমস্যা!");
    }
  };

  // ---------------------------------------
  // TABLE DATA
  // ---------------------------------------
  const columns = [
    { key: "kitab", label: "কিতাব" },
    { key: "jamat", label: "জামাত" },
    { key: "sheetnumber", label: "সীট নাম্বার" },
    { key: "description", label: "বর্ণনা" },
   
  ];

  const data = homeworks.map((p) => ({
    id: p.id,
    kitab: kitabs.find((k) => k.id === p.subject_id)?.name || "N/A",
    jamat: jamats.find((j) => j.id === p.class_id)?.name || "N/A",
    sheetnumber: sheetNumbers.find((s) => s.id === p.sheet_id)?.sheet_number || "N/A",
    description: p.description,
    action: (
      <>
        <button className="btn btn-view" onClick={() => editHomework(p)}>
          Edit
        </button>
        <button className="btn btn-delete" onClick={() => deleteHomework(p.id)}>
          Delete
        </button>
      </>
    ),
  }));

  return (
    <main className="main-container">

      <button className="btn btn-add" onClick={() => setShowmodel(true)}>নতুন হোমওয়ার্ক যোগ করুন</button>

      <Table columns={columns} data={data} />

      {/* ------------ MODAL ------------ */}
      {showModel && (
        <ModelBox onClose={() => setShowmodel(false)} title="বাড়ির কাজ">
 <div className="modal-form-row">
          <label>সীট নাম্বার</label>
          <select
            value={currentHw.sheet_number}
            onChange={(e) =>
              setCurrentHw({ ...currentHw, sheet_number: e.target.value })
            }
          >
            <option value="">সিলেক্ট করুন</option>
            {sheetNumbers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sheet_number} - {formatBanglaDate(s.date)}
              </option>
            ))}
          </select>

          </div>
          <div className="modal-form-row">
          <label>কিতাব - জামাত</label>
          <select
            value={currentHw.subject_id}
            onChange={(e) => {
              const kitabId = e.target.value;
              const selectedKitab = kitabs.find((k) => k.id == kitabId);

              setCurrentHw({
                ...currentHw,
                subject_id: selectedKitab.id,
                class_id: selectedKitab.jamat,
              });
            }}
          >
            <option value="">সিলেক্ট করুন</option>
            {kitabs.map((k) => {
              const jamatName = jamats.find((j) => j.id === k.jamat)?.name || "Unknown";
              return (
                <option key={k.id} value={k.id}>
                  {k.name} - {jamatName}
                </option>
              );
            })}
          </select>
</div>
          <label>বর্ণনা</label>
          <textarea
            value={currentHw.description}
            onChange={(e) =>
              setCurrentHw({ ...currentHw, description: e.target.value })
            }
            style={{
                width:"95%",
                height:"200px",

            }}
          ></textarea>

          <button className="btn btn-delete" onClick={() => setShowmodel(false)}>
            Close
          </button>

          <button className="btn btn-save" onClick={saveHomework}>
            {editId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
          </button>

        </ModelBox>
      )}

    </main>
  );
}
