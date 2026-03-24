import React, { useState, useEffect } from "react";
import { getCachedImage } from "../utils/cacheImage";

export default function ModalBox({ title, children, onClose }) {
  const [headerSrc, setHeaderSrc] = useState("");
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const loadImage = async () => {
      const src = await getCachedImage("APP_HEADER");
      const logoSrc = await getCachedImage("APP_LOGO");
      setHeaderSrc(src);
      setLogo(logoSrc);
    };
    loadImage();
  }, []);

  // Header style as you defined it
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100px",
    backgroundColor: "#222", // Background for the header
    color: "white",
    padding: "20px",
    width: "100%",
    boxSizing: "border-box",
    position: "relative",
    backgroundImage: headerSrc ? `url(${headerSrc})` : "none",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center"
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ position: "relative", overflow: "hidden" }}>
        
        {/* HEADER */}
        <div className="modal-header" style={headerStyle}>
          <p>.</p>
          {onClose && (
            <button className="modal-close" onClick={onClose}>✕</button>
          )}
        </div>

        {/* CONTENT AREA WITH WATERMARK */}
        <div className="modal-content" style={{ position: "relative", padding: "20px", minHeight: "200px" }}>
          
          {/* THE WATERMARK */}
          {logo && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundImage: `url(${logo})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              width: "80%",   // Size of the watermark relative to container
              height: "80%",
              opacity: 0.08,  // Very light so text remains readable
              pointerEvents: "none", // Allows clicking through to text/buttons
              zIndex: 0
            }} />
          )}

          {/* ACTUAL CONTENT */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ marginTop: 0 }}>{title}</h3>
            {children}
          </div>
        </div>
        
      </div>
    </div>
  );
}