import { useEffect, useState } from "react";
import ApiManager from "../apimanger";

export default function UpozilaComponent({ districtId, value, onChange }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!districtId) {
      setData([]);
      return;
    }
    ApiManager.get(`/address/upazilas/${districtId}`).then((res) => {
      setData(res.data);
    });
  }, [districtId]);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">উপজেলা নির্বাচন করুন</option>
      {data.map((u) => (
        <option key={u.id} value={u.id}>{u.bn}</option>
      ))}
    </select>
  );
}

