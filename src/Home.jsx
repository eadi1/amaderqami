import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ApiManager from "./apimanger";
import IslamicCard from "./components/islamicCard";
import "./dashboard.css";

export default function Home() {
  const [classAttendance, setClassAttendance] = useState([]);
  const [jamats, setJamats] = useState([]);
  const [bivag, setBivag] = useState([]);
  const [dashboard, setDashboard] = useState({  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboard = await ApiManager.get("/dashboard");
      const jamatData = await ApiManager.get("/jamat");
      const bivagData = await ApiManager.get("/bivag");
      setBivag(bivagData);
      setDashboard(dashboard);
      setClassAttendance(dashboard.class_attendance || []);
      setJamats(jamatData);
    } catch (err) {
      console.error(err);
    }
  };

const getJamatName = (id) => {
  const jamat = jamats.find((j) => j.id == id);
  if (!jamat) return `জামাত ${id}`;

  const divisionName =
    bivag.find((b) => b.id == jamat.division)?.name || "";

  return divisionName
    ? `${jamat.name} (${divisionName})`
    : jamat.name;
};

  /* 🔹 Bar chart aggregated data */
  const barData = classAttendance.map((c) => ({
    name: getJamatName(c.class_id),
     উপস্থিত: Number(c.present),
  অনুপস্থিত: Number(c.absent),
  ছুটি: Number(c.leave_count),
  }));

  return (
    <main className="main-container">
      <div className="dashboard-container">

        <h2 className="dashboard-title">📚 ক্লাস ভিত্তিক হাজিরা</h2>

        {/* ================= CARDS ================= */}
      <div className="card-grid">
        <IslamicCard
    title="মোট শিক্ষার্থী"
    value={dashboard.summary?.total_students || 0}
    icon="📚"
    color="#2e7d32"
  />
  <IslamicCard
    title="মোট শিক্ষক"
    value={dashboard.summary?.total_teachers || 0}
    icon={"👩‍🏫"}
    color="#2e7d32"
  />

  <IslamicCard
    title="আজ উপস্থিত"
    value={dashboard.summary?.today_present || 0}
    icon="✅"
    color="#2e7d32"
  />

  <IslamicCard
    title="আজ অনুপস্থিত"
    value={dashboard.summary?.today_absent || 0}
    icon="❌"
    color="#c62828"
  />

  <IslamicCard
    title="ছুটিতে"
    value={dashboard.summary?.today_leave || 0}
    icon="🕌"
    color="#f9a825"
  />
</div>

        {/* ================= BAR CHART ================= */}
        <h3 className="section-title">📊 শ্রেনী ভিত্তিক উপস্থিতি</h3>

        <div className="chart-card">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="উপস্থিত" fill="#2e7d32" />
              <Bar dataKey="অনুপস্থিত" fill="#c62828" />
              <Bar dataKey="ছুটি" fill="#f9a825" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </main>
  );
}
