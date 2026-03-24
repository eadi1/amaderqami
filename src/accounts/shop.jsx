import React, { useState, useEffect } from "react";
import ApiManager from "../apimanger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../components/Table";
import ModalBox from "../components/modelbox";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";

export default function Shop() {
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    owner_name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    setLoading(true);
    try {
      const data = await ApiManager.get("/shop");
      setShopItems(data);
    } catch (err) {
      toast.error("দোকানের তথ্য লোড করতে সমস্যা হয়েছে!");
      console.error(err);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      toast.warn("নাম ও ফোন নাম্বার আবশ্যক!");
      return;
    }

    try {
      if (editMode) {
        await ApiManager.put(`/shop/${selectedId}`, formData);
        toast.success("দোকানের তথ্য হালনাগাদ হয়েছে!");
      } else {
        await ApiManager.post("/shop", formData);
        toast.success("নতুন দোকান যুক্ত হয়েছে!");
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ name: "", owner_name: "", phone: "", address: "" });
      fetchShopItems();
    } catch (err) {
      toast.error("সংরক্ষণে সমস্যা হয়েছে!");
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      owner_name: item.owner_name,
      phone: item.phone,
      address: item.address,
    });
    setSelectedId(item.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিত মুছে ফেলতে চান?")) return;

    try {
      await ApiManager.delete(`/shop/${id}`);
      toast.success("দোকানটি মুছে ফেলা হয়েছে!");
      fetchShopItems();
    } catch (err) {
      toast.error("মুছে ফেলতে সমস্যা হয়েছে!");
      console.error(err);
    }
  };

  const columns = [
    { key: "name", label: "দোকানের নাম" },
    { key: "owner_name", label: "মালিকের নাম" },
    { key: "phone", label: "ফোন নাম্বার" },
    { key: "address", label: "ঠিকানা" },
     ];

  const tableData = shopItems.map((item) => ({
    ...item,
    action: (
      <div className="flex gap-2 justify-center">
        <button
          className="btn btn-edit"
          onClick={() => handleEdit(item)}
          title="সম্পাদনা করুন"
        >
          <FaEdit />
        </button>
        <button
          className="btn btn-delete"
          onClick={() => handleDelete(item.id)}
          title="মুছুন"
        >
          <FaTrashAlt />
        </button>
      </div>
    ),
  }));

  return (
    <main className="main-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="page-title">দোকানের তালিকা</h2>
        <button
          onClick={() => {
            setEditMode(false);
            setFormData({ name: "", owner_name: "", phone: "", address: "" });
            setShowModal(true);
          }}
          className="btn btn-add flex items-center gap-1"
        >
          <FaPlus /> নতুন দোকান
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>⏳ লোড হচ্ছে...</p>
      ) : (
        <Table columns={columns} data={tableData} />
      )}

      {showModal && (
        <ModalBox>
          <h2>{editMode ? "দোকান সম্পাদনা করুন" : "নতুন দোকান যোগ করুন"}</h2>

          <div className="space-y-3 mt-3">
            <div>
              <label className="block mb-1">দোকানের নাম:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>

            <div>
              <label className="block mb-1">মালিকের নাম:</label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>

            <div>
              <label className="block mb-1">ফোন নাম্বার:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>

            <div>
              <label className="block mb-1">ঠিকানা:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="btn btn-delete"
                onClick={() => setShowModal(false)}
              >
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
