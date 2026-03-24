import { useEffect, useState } from "react";
import ApiManager from "../apimanger";

export default function DistrictComponent({ divisionId, value, onChange }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!divisionId) {
      setData([]);
      return;
    }
    ApiManager.get(`/address/districts/${divisionId}`).then((res) => {
      setData(res.data);
    });
  }, [divisionId]);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">জেলা নির্বাচন করুন</option>
      {data.map((d) => (
        <option key={d.id} value={d.id}>{d.bn}</option>
      ))}
    </select>
  );
}
