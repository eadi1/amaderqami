import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";

export default function CostType() {
  const [loading, setLoading] = useState(false);
  const [costTypes, setCostTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, category_name: "", description: "" });

  // 🔹 Load cost types from API
  useEffect(() => {
    fetchCostTypes();
  }, []);

  const fetchCostTypes = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/cost-type");
      setCostTypes(data);
    } catch (err) {
      toast.error("ডাটা লোড করতে সমস্যা হচ্ছে!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 🔹 Save (Add or Update)
  const handleSave = async () => {
    if (!formData.category_name) {
      toast.warn("নাম ঘর পূরণ করুন!");
      return;
    }

    try {
      if (formData.id) {
        await ApiManager.put(`/cost-type/${formData.id}`, formData);
        toast.success("সফলভাবে আপডেট হয়েছে!");
      } else {
        await ApiManager.post("/cost-type", formData);
        toast.success("সফলভাবে যুক্ত হয়েছে!");
      }
      setShowModal(false);
      setFormData({ id: null, category_name: "", description: "" });
      fetchCostTypes();
    } catch (err) {
      toast.error("ডাটা সংরক্ষণ করতে সমস্যা হচ্ছে!");
    }
  };

  // 🔹 Edit existing cost type
  const handleEdit = (costType) => {
    setFormData({
      id: costType.id,
      category_name: costType.category_name,
      description: costType.description,
    });
    setShowModal(true);
  };

  // 🔹 Delete cost type
  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?")) return;
    try {
      await ApiManager.delete(`/cost-type/${id}`);
      toast.success("মুছে ফেলা হয়েছে!");
      fetchCostTypes();
    } catch (err) {
      toast.error("মুছে ফেলতে সমস্যা হয়েছে!");
    }
  };

  // 🔹 Table columns
  const columns = [
    { key: "category_name", label: "খাতের নাম" },
    { key: "description", label: "বিবরণ" },
    
  ];

  // 🔹 Table data with action buttons
  const tableData = costTypes.map((c) => ({
    ...c,
    action: (
      <div className="flex space-x-2">
        <button className="btn btn-edit" onClick={() => handleEdit(c)}>
          <FaEdit />
        </button>
        <button className="btn btn-delete" onClick={() => handleDelete(c.id)}>
          <FaTrashAlt />
        </button>
      </div>
    ),
  }));

  const editMode = formData.id !== null;

  return (
    <main className="main-container p-4">
      <ToastContainer />
      <div className="header flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">খরচের খাত</h2>
        <button className="btn btn-add flex items-center space-x-1" onClick={() => setShowModal(true)}>
          <FaPlus /> <span>নতুন যুক্ত করুন</span>
        </button>
      </div>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        <Table columns={columns} data={tableData} />
      )}

      {showModal && (
        <ModalBox>
          <h2 className="text-lg font-semibold mb-3">
            {editMode ? "খরচের খাত সম্পাদনা করুন" : "নতুন খরচের খাত যোগ করুন"}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block mb-1">খাতের নাম:</label>
              <input
                type="text"
                name="category_name"
                value={formData.category_name}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>

            <div>
              <label className="block mb-1">বিবরণ:</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button className="btn btn-delete" onClick={() => setShowModal(false)}>
                বাতিল
              </button>
              <button className="btn btn-add" onClick={handleSave}>
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </ModalBox>
      )}
    </main>
  );
}
