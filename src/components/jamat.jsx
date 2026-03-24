import { useEffect, useState } from "react";
import ApiManager from "../apimanger";

export default function JamatComponent({ divisionId, value, onChange }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!divisionId) {
      setData([]);
      return;
    }
    ApiManager.get(`/jamat/bivag/${divisionId}`).then((res) => {
      setData(res);
    });
  }, [divisionId]);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">শ্রেনী নির্বাচন করুন</option>
      {data.map((d) => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>
  );
}
