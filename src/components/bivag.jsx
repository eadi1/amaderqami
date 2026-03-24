import { useEffect, useState } from "react";
import ApiManager from "../apimanger";

export default function BivagComponent({ value, onChange }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    ApiManager.get("/bivag").then((res) => {
      setData(res);
    });
  }, []);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">বিভাগ নির্বাচন করুন</option>
      {data.map((d) => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>
  );
}
