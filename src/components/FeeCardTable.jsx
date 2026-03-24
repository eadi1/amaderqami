import React from "react";

const FeeCardTable = ({ fees, coldb = [], feetype = [] }) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fees1=fees.fees || [];

  console.log(fees.fees);
  // ✅ সংখ্যাকে বাংলায় রূপান্তর
  const toBanglaDigits = (num) => {
    if (num === null || num === undefined || num === "") return "০";
    const banglaDigits = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[digit]);
  };

  // ✅ তারিখকে বাংলা ফরম্যাটে রূপান্তর
  const formatBanglaDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return new Date(dateStr).toLocaleDateString('bn-BD');
  };

  const banglaMonths = {
    jan: "জানুয়ারি", feb: "ফেব্রুয়ারি", mar: "মার্চ", apr: "এপ্রিল",
    may: "মে", jun: "জুন", jul: "জুলাই", aug: "আগস্ট",
    sep: "সেপ্টেম্বর", oct: "অক্টোবর", nov: "নভেম্বর", dec: "ডিসেম্বর"
  };

  return (
    <div className="fee-card-wrapper" style={{ marginTop: "20px" }}>
      
      {/* ১. স্টুডেন্ট ইনফো হেডার (বাম পাশে নাম, ডান পাশে জমা) */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "10px", 
        padding: "10px", 
        background: "#f8f9fa", 
        borderRadius: "5px",
        border: "1px solid #ddd"
      }}>
        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#2c3e50" }}>
          👤 নাম: <span style={{ color: "#2980b9" }}>{fees.studentName || "লোড হচ্ছে..."}</span>
        </div>
        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#2c3e50" }}>
          💰 জমাত: <span style={{ color: "#27ae60" }}>{toBanglaDigits(fees?.jamatName)} </span>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          border="1"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
            fontSize: "13px",
            minWidth: "900px"
          }}
        >
          <thead>
            <tr style={{ background: "#2c3e50", color: "#fff" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>ফীর ধরন</th>
              {months.map((m) => (
                <th key={m} style={{ padding: "8px" }}>
                  {banglaMonths[m.toLowerCase()]}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {fees1.map((fee, index) => {
              const currentFeeType = feetype.find((ft) => ft.name === fee.type);
              const colName = currentFeeType?.db_col;
              const amountFromDb = coldb[colName] || currentFeeType?.amount || 0;

              return (
                <tr key={index} style={{ background: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                  <td style={{ fontWeight: "bold", textAlign: "left", padding: "10px", border: "1px solid #ddd" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>{fee.type}</span>
                      <small style={{ color: "#2980b9", fontWeight: "normal" }}>
                        (নির্ধারিত: ৳ {toBanglaDigits(amountFromDb)})
                      </small>
                    </div>
                  </td>

                  {fee.isMonthly ? (
                    months.map((month) => {
                      const paymentData = fee.payments?.[month];
                      const amount = paymentData?.amount;
                      const date = paymentData?.date;
                      const isPaid = amount && parseFloat(amount) > 0;

                      return (
                        <td key={month} style={{ padding: "5px", border: "1px solid #ddd", verticalAlign: "middle" }}>
                          {isPaid ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                              <span style={{ color: "#27ae60", fontWeight: "bold", fontSize: "14px" }}>
                                {toBanglaDigits(amount)}
                              </span>
                              <span style={{ 
                                color: "#7f8c8d", fontSize: "9px", borderTop: "1px solid #eee", paddingTop: "2px", width: "100%" 
                              }}>
                                {formatBanglaDate(date)}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: parseFloat(amountFromDb) === 0 ? "#ccc" : "#e74c3c", fontSize: "11px" }}>
                              {parseFloat(amountFromDb) === 0 ? "—" : "বকেয়া"}
                            </span>
                          )}
                        </td>
                      );
                    })
                  ) : (
                    <td colSpan={months.length} style={{ fontWeight: "bold", padding: "10px", background: "#ecf0f1", border: "1px solid #ddd", color: "#2980b9" }}>
                      মোট পরিশোধ: {toBanglaDigits(fee.amount)} ৳
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeCardTable;