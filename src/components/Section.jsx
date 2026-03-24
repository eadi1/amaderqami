import React, { useState } from "react";

export default function Section({ title, children, dropdown = false, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleDropdown = () => {
    if (dropdown) setIsOpen(!isOpen);
  };

  return (
    <div className={`section-card ${isOpen ? "open" : "closed"}`} style={{ marginBottom: "15px", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
      {title && (
        <div 
          className="section-header" 
          onClick={toggleDropdown} 
          style={{ 
            cursor: dropdown ? "pointer" : "default", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            padding: "10px 15px",
            background: "#f8f9fa",
            borderBottom: (isOpen && dropdown) ? "1px solid #ddd" : "none",
            userSelect: "none" // বারবার ক্লিকে যাতে টেক্সট সিলেক্ট না হয়ে যায়
          }}
        >
          <h2 className="section-title" style={{ margin: 0, fontSize: "1.2rem" }}>{title}</h2>
          {dropdown && (
            <div 
              style={{ 
                transition: "0.4s ease", 
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                fontSize: "0.8rem",
                color: "#666"
              }}
            >
              ▼
            </div>
          )}
        </div>
      )}
      
      <div style={{
        // FIX: 'auto' এর বদলে বড় একটি সংখ্যা (যেমন 1000px) দিন যা কন্টেন্টের চেয়ে বড়
        maxHeight: isOpen ? "2000px" : "0px", 
        
        // কন্টেন্ট বড় হলে স্ক্রল দেখাবে
        overflowY: "auto", 
        
        // ট্রানজিশন এখন কাজ করবে কারণ সংখ্যা থেকে সংখ্যায় যাচ্ছে
        transition: "max-height 0.5s cubic-bezier(0, 1, 0, 1)", 
        background: "#fff"
      }}>
        <div className="section-content" style={{ padding: "15px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}