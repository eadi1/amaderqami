import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { BsJustify, BsPersonCircle, BsArrowsFullscreen, BsFullscreenExit } from "react-icons/bs";
import { BiSolidLogOut } from "react-icons/bi";
import { FaCalculator, FaSyncAlt } from "react-icons/fa";

import ApiManager from "./apimanger";

import "react-toastify/dist/ReactToastify.css";
import "./css/header.css";
import { clearCachedImage } from "./utils/cacheImage";
function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.pathname.split("/").filter(Boolean).length > 1;
  const picture = Cookies.get("picture");
const madrasaName = Cookies.get("institute_name_bn");

  /* ===== LOGOUT ===== */
  const handleLogout = () => {
    ["token", "app_key", "picture", "role", "userId", "permissions"].forEach(c => Cookies.remove(c));
    navigate("/auth");

     Promise.all([
      clearCachedImage("APP_LOGO"),
      clearCachedImage("APP_HEADER"),
      clearCachedImage("APP_FOOTER"),
    ]);
    
  };

  /* ===== FULLSCREEN ===== */
  const [isMaximized, setIsMaximized] = useState(false);
  const toggleMaximize = () => {
    if (!isMaximized) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const handleFSChange = () => setIsMaximized(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  /* ===== CALCULATOR ===== */
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcValue, setCalcValue] = useState("");
  const calcRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const savedPos = JSON.parse(localStorage.getItem("calcPos"));
    if (savedPos && calcRef.current) {
      calcRef.current.style.left = `${savedPos.x}px`;
      calcRef.current.style.top = `${savedPos.y}px`;
    }
  }, []);

  useEffect(() => {
    const handleMove = e => {
      if (!dragging) return;
      calcRef.current.style.left = `${e.clientX - offset.x}px`;
      calcRef.current.style.top = `${e.clientY - offset.y}px`;
    };
    const handleUp = () => setDragging(false);

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, offset]);

  const handleMouseDown = e => {
    setDragging(true);
    const rect = calcRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleCalcEvaluate = () => {
    try { setCalcValue(eval(calcValue).toString()); }
    catch { setCalcValue("Error"); }
  };


  return (
   <header className="header">
  <div className="header-left">
    <div style={{ zIndex: 20000 }}>
      <div className="menu-btn" onClick={toggleSidebar}>
        <BsJustify className="icon" />
      </div>
    </div>

    {showBack && (
      <button onClick={() => navigate(-1)} className="btn btn-back">
        Back
      </button>
    )}
  </div>

  {/* ---------- MADRASA NAME CENTER ---------- */}
  <div className="header-center">
    {madrasaName || "আমাদের মাদ্রাসা"}
  </div>

  <div className="header-right">
    <span className="icon" onClick={toggleMaximize}>
      {isMaximized ? <BsFullscreenExit /> : <BsArrowsFullscreen />}
    </span>

    <span className="icon" onClick={() => setShowCalculator(!showCalculator)}>
      <FaCalculator />
    </span>

    {picture ? (
      <img src={picture} alt="User" className="header-profile-picture" />
    ) : (
      <BsPersonCircle className="icon" />
    )}

    <BiSolidLogOut className="icon" onClick={handleLogout} />
  </div>

  {showCalculator && (
    <div
      className="calculator-popup"
      ref={calcRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        top: 50,
        left: 50,
        zIndex: 1000,
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      <input value={calcValue} readOnly />
      <div className="calculator-buttons">
        {["7", "8", "9", "/", "C", "4", "5", "6", "*", "DEL", "1", "2", "3", "-", "0", ".", "=", "+"].map(
          (b) => (
            <button
              key={b}
              onClick={() => {
                if (b === "C") setCalcValue("");
                else if (b === "DEL") setCalcValue((v) => v.slice(0, -1));
                else if (b === "=") handleCalcEvaluate();
                else setCalcValue((v) => v + b);
              }}
            >
              {b}
            </button>
          )
        )}
      </div>
    </div>
  )}
</header>

  );
}

export default Header;
