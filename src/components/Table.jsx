import React, { useState, useMemo ,useEffect} from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Table.css";
import Section from "./Section";
import Cookies from "js-cookie";
import { getCachedImage } from "../utils/cacheImage";

export default function CustomTable({ columns = [], data = [] }) {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(1);
  const [newColName, setNewColName] = useState("");
  const [colMenuOpen, setColMenuOpen] = useState(null);
  const [showColDropdown, setShowColDropdown] = useState(false);
  

  // English to Bangla digits
  const toBanglaNumber = (num) => {
    const banglaDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => {
      if (/\d/.test(d)) return banglaDigits[parseInt(d)];
      return d;
    }).join("");
  };
useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest(".col-move-menu") && !e.target.closest(".sortable-th")) {
      setColMenuOpen(null);
    }
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

  // ------------------ VISIBLE COLUMNS ------------------
  const [visibleCols, setVisibleCols] = useState(
    columns.map(c => ({ ...c, visible: c.visible !== undefined ? c.visible : true }))
  );

  const toggleColumn = (key) =>
    setVisibleCols(prev => prev.map(c => (c.key === key ? { ...c, visible: !c.visible } : c)));

  const filteredColumns = visibleCols.filter(c => c.visible);

  // ------------------ SEARCH FILTER ------------------
  const filteredData = useMemo(() => {
    return data.filter(row =>
      filteredColumns.some(col =>
        String(row[col.key] || "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data, filteredColumns]);

  // ------------------ SORTING ------------------
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  const handleSort = (key, dir) => {
    if (dir === "asc") setSortConfig({ key, direction: "asc" });
    else if (dir === "desc") setSortConfig({ key, direction: "desc" });
    else setSortConfig({ key: "", direction: "" }); // clear sort
    setColMenuOpen(null);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sortConfig.key] || "").toLowerCase();
      const bVal = String(b[sortConfig.key] || "").toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // ------------------ PAGINATION ------------------
  const totalPages = entries === -1 ? 1 : Math.ceil(sortedData.length / entries);
  const paginatedData =
    entries === -1
      ? sortedData
      : sortedData.slice((page - 1) * entries, page * entries);

  // ------------------ COLUMN MOVE ------------------
  const moveCol = (index, direction) => {
    const newCols = [...visibleCols];
    if (direction === "left" && index > 0) [newCols[index-1], newCols[index]] = [newCols[index], newCols[index-1]];
    if (direction === "right" && index < newCols.length -1) [newCols[index], newCols[index+1]] = [newCols[index+1], newCols[index]];
    setVisibleCols(newCols);
    setColMenuOpen(null);
  };

  // ------------------ COPY ------------------
  const handleCopy = () => {
    let text = filteredColumns.map(c => c.label).join("\t") + "\n";
    paginatedData.forEach(row => {
      text += filteredColumns.map(c => row[c.key]).join("\t") + "\n";
    });
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // ------------------ EXCEL ------------------
  const handleExcel = () => {
    const excelData = paginatedData.map(row => {
      let obj = {};
      filteredColumns.forEach(col => obj[col.label] = row[col.key]);
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "data.xlsx");
  };

  // ------------------ PRINT ------------------
const handlePrint = async () => {
  // 1️⃣ Ask user for title
  let title = prompt("Enter title for the printout:", "");
  if (!title) title = "Untitled"; // fallback

  // 2️⃣ Open print window
  const printWin = window.open("", "", "width=900,height=700");

  // 3️⃣ Get cached images
  const headerSrc = await getCachedImage("APP_HEADER");
  const logoSrc = await getCachedImage("APP_LOGO");

  console.log("Header src:", headerSrc);
  console.log("Logo src:", logoSrc);

  // 4️⃣ Header HTML
  const headerHTML = `
    <div style="
      display:block;
      margin:0;
      padding:0;
      border:none;
      text-align:center;
    ">
      <img 
        src="${headerSrc}" 
        alt="Header" 
        style="
          display:block;
          width:100%;
          height:auto;
          max-height:200px;
          margin:0;
          padding:0;
        background-size:cover;
        background-position:center;
          border:none;
        " 
      />
    </div>
  `;

  // 5️⃣ Table HTML
  const tableHTML = `
    <table style="width:90%; margin:5%; border-collapse:collapse;">
      <thead>
        <tr>
          ${filteredColumns.map(
            col => `<th style="border:1px solid #ccc; padding:8px; background:#f0f0f0;">${col.label}</th>`
          ).join("")}
        </tr>
      </thead>
      <tbody>
        ${paginatedData.map(
          row => `<tr>${filteredColumns.map(c => `<td style="border:1px solid #ccc; padding:8px;">${row[c.key]}</td>`).join("")}</tr>`
        ).join("")}
      </tbody>
    </table>
  `;

  // 6️⃣ Watermark HTML
  const watermarkHTML = logoSrc ? `
    <div style="
      position:fixed;
      top:50%;
      left:50%;
      transform:translate(-50%, -50%);
      opacity:0.1;
      z-index:0;
      pointer-events:none;
      width:50%;
      text-align:center;
    ">
      <img src="${logoSrc}" alt="Watermark" style="width:100%; height:auto; object-fit:contain;" />
    </div>
  ` : "";

  // 7️⃣ Write everything to print window
  printWin.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: SolaimanLipi,sans-serif; margin:0; padding:0; position:relative; }
          table { width:100%; border-collapse:collapse; z-index:1; position:relative; }
          th, td { border:1px solid #ccc; padding:8px; }
          h2 { text-align:center; z-index:1; position:relative; }
        </style>
      </head>
      <body>
        ${headerHTML}
        ${watermarkHTML}
        <h2>${title}</h2>
        ${tableHTML}
      </body>
    </html>
  `);

  printWin.document.close();

  // 8️⃣ Ensure images load before printing
  const images = printWin.document.querySelectorAll("img");
  let loadedCount = 0;

  if (images.length === 0) {
    printWin.print();
  } else {
    images.forEach(img => {
      if (img.complete) {
        loadedCount++;
        if (loadedCount === images.length) printWin.print();
      } else {
        img.onload = () => {
          loadedCount++;
          if (loadedCount === images.length) printWin.print();
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === images.length) printWin.print();
        };
      }
    });
  }
};


  return (
    <Section>
      <div className="table-container">
        {/* ---- CONTROL ROW ---- */}
        <div className="table-controls-row">
          {/* Entries */}
          <div className="control-box">
            <label>
              Show{" "}
              <select className="form-control form-control-sm" value={entries} onChange={e => { setEntries(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={-1}>All</option>
              </select>{" "} entries
            </label>
          </div>

          {/* Buttons */}
          <div className="control-box buttons">
            <button onClick={handleCopy} className="btn btn-info btn-sm">Copy</button>
            <button onClick={handleExcel} className="btn btn-success btn-sm">Excel</button>
            <button onClick={handlePrint} className="btn btn-danger btn-sm">Print</button>

            {/* Column dropdown */}
            <div className="dropdown-container">
              <button className="btn btn-warning btn-sm" onClick={() => setShowColDropdown(prev => !prev)}>কলাম দৃশ্যমানতা</button>
              {showColDropdown && (
                <div className="dropdown-menu-custom">
                  <div className="add-column-dropdown">
                    <input type="text" placeholder="নতুন কলাম নাম" value={newColName} onChange={e => setNewColName(e.target.value)} />
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      if (!newColName.trim()) return;
                      const key = newColName.toLowerCase().replace(/\s+/g, "_");
                      setVisibleCols([...visibleCols, { key, label: newColName, visible: true }]);
                      data.forEach(row => row[key] = "");
                      columns.push({ key, label: newColName });
                      setNewColName("");
                    }}>Add</button>
                  </div>
                  {visibleCols.map(col => (
                    <label key={col.key} className="dropdown-item-custom">
                      <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.key)} /> {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="control-box search-box">
            <label>
              Search:
              <input type="search" className="form-control form-control-sm" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="search..." />
            </label>
          </div>
        </div>
        

        {/* ---- TABLE --add cromik no-- */}
        <table className="custom-table">
          <thead>
            <tr>
                <th>ক্রমিক</th>
              {filteredColumns.map((col, index) => (
                <th key={col.key} className="sortable-th" style={{position:"relative"}} onClick={() => setColMenuOpen(col.key)}>
               
                  {col.label}
                  {colMenuOpen === col.key && (
                    <div className="col-move-menu">
                      <button disabled={index===0} onClick={e=>{e.stopPropagation(); moveCol(index,"left");}}>← Move Left</button>
                      <button disabled={index===filteredColumns.length-1} onClick={e=>{e.stopPropagation(); moveCol(index,"right");}}>Move Right →</button>
                      <hr style={{margin:"4px 0"}} />
                      <button onClick={e=>{e.stopPropagation(); handleSort(col.key,"asc");}}>Sort Asc ↑</button>
                      <button onClick={e=>{e.stopPropagation(); handleSort(col.key,"desc");}}>Sort Desc ↓</button>
                      <button onClick={e=>{e.stopPropagation(); handleSort(col.key,"none");}}>Clear Sort</button>
                    </div>
                  )}
                </th>
              ))}
              <th>কর্ম</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((row, index) => (
              <tr key={row.id}>
               
                <td>{((page - 1) * entries + index + 1).toLocaleString("bn-BD")}</td>
                {filteredColumns.map(col => <td key={col.key}>{row[col.key]}</td>)}
                <td>{row.action}</td>
              </tr>
            )) : (
              <tr><td colSpan={filteredColumns.length+1} className="no-data">কোন তথ্য পাওয়া যায়নি</td></tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
       {/* ---- PAGINATION ---- */}
{entries !== -1 && totalPages > 1 && (
  <div className="pagination-container" style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "5px", flexWrap: "wrap" }}>
    
    {/* Previous Button */}
    <button 
      className="page-btn" 
      disabled={page === 1} 
      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
    >
      পূর্ববর্তী
    </button>

    {/* Page Numbers */}
    {[...Array(totalPages)].map((_, i) => {
      const pageNum = i + 1;
      // খুব বেশি পেজ হলে সব না দেখিয়ে শুধু বর্তমান পেজের আশেপাশের গুলো দেখানোর লজিক
      if (totalPages > 7 && Math.abs(page - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
        if (pageNum === 2 || pageNum === totalPages - 1) return <span key={i}>...</span>;
        return null;
      }

      return (
        <button 
          key={i} 
          className={`page-btn ${page === pageNum ? "active" : ""}`} 
          onClick={() => setPage(pageNum)}
          style={{
            padding: "5px 10px",
            border: "1px solid #ddd",
            background: page === pageNum ? "#2c3e50" : "#fff",
            color: page === pageNum ? "#fff" : "#000",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          {toBanglaNumber(pageNum)}
        </button>
      );
    })}

    {/* Next Button */}
    <button 
      className="page-btn" 
      disabled={page === totalPages} 
      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
    >
      পরবর্তী
    </button>
  </div>
)}
      </div>
    </Section>
  );
}
