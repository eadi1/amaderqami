import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Link, useLocation } from "react-router-dom";
import "./css/sidebar.css";

import { BiSolidDollarCircle } from "react-icons/bi";
import { FaUserTie } from "react-icons/fa";
import {
  BsMortarboard,
  BsGrid1X2Fill,
  BsPeopleFill,
  BsBookHalf,
  BsReceipt,
  BsMenuButtonWideFill,
  BsFillGearFill,
} from "react-icons/bs";

function Sidebar({ open, toggleSidebar }) {
  const location = useLocation();
  const [privileges, setPrivileges] = useState([]);

  const userRole = (Cookies.get("role") || "").toLowerCase();
  const permissionsCookie = Cookies.get("permissions");

  const menus = [
    { key: "dashboard", label: "ড্যাশবোর্ড", href: "/", icon: <BsGrid1X2Fill /> },
    { key: "students", label: "শিক্ষার্থী ব্যবস্থাপনা", href: "/students", icon: <BsPeopleFill /> },
    { key: "teachers", label: "শিক্ষক ব্যবস্থাপনা", href: "/teachers", icon: <BsMortarboard /> },
    { key: "teachers_corner", label: "শিক্ষক বাতায়ন", href: "/teacher_corner", icon: <FaUserTie /> },
    { key: "accounting", label: "হিসাব-নিকাশ", href: "/accounting", icon: <BiSolidDollarCircle /> },
    { key: "admission", label: "ভর্তি", href: "/admission", icon: <BsPeopleFill /> },
    { key: "library", label: "গ্রন্থাগার", href: "/library", icon: <BsBookHalf /> },
    { key: "exam", label: "পরীক্ষা", href: "/exam-management", icon: <BsReceipt /> },
    { key: "reports", label: "প্রতিবেদন", href: "/report", icon: <BsMenuButtonWideFill /> },
    { key: "settings", label: "সেটিংস", href: "/site-settings", icon: <BsFillGearFill /> },
  ];

  useEffect(() => {
    let perms = [];
    if (permissionsCookie) {
      try {
        const parsed = JSON.parse(permissionsCookie);
        if (Array.isArray(parsed)) perms = parsed.map(p => p.toLowerCase());
      } catch {}
    }

    if (userRole === "administrator") setPrivileges(menus.map(m => m.key.toLowerCase()));
    else setPrivileges(perms.length ? perms : ["dashboard"]);
  }, [permissionsCookie, userRole]);

  return (
    <aside className={`sidebar ${open ? "sidebar-responsive" : ""}`}>
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <BsMortarboard /> আমাদের কওমী
        </div>
        <span className="close_icon" onClick={toggleSidebar}>✖</span>
      </div>

      <ul className="sidebar-list">
        {menus
          .filter(menu => privileges.includes(menu.key.toLowerCase()))
          .map(menu => (
            <li
              key={menu.key}
              className={`sidebar-list-item ${location.pathname === menu.href ? "active" : ""}`}
              onClick={toggleSidebar}
            >
              <Link to={menu.href}>
                <span className="sidebar-icon">{menu.icon}</span>
                <span className="sidebar-label">{menu.label}</span>
              </Link>
            </li>
          ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
