import { useEffect, useState } from "react";
import ApiManager from "../apimanger";

export default function DivsionComponent({ value, onChange }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    ApiManager.get("/address/divisions").then((res) => {
      setData(res.data);
    });
  }, []);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">বিভাগ নির্বাচন করুন</option>
      {data.map((d) => (
        <option key={d.id} value={d.id}>{d.bn}</option>
      ))}
    </select>
  );
}
