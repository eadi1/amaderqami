import React from "react";
// Custom CSS
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave,FaPrint,FaEye, FaDownload } from "react-icons/fa";

const Buttons = ({ type, onClick, disabled = false }) => {
  const getIcon = () => {
    switch (type) {
      //print icons based on type
      case "print":
        return <FaPrint />;
      case "add":
        return <FaPlus />;
      case "view":
        return <FaEye />;
      case "download":
        return  <FaDownload/>;
      case "edit":
        return <FaEdit />;
      case "delete":
        return <FaTrash />;
      case "cancel":
        return <FaTimes />;
      case "save":
        return <FaSave />;
      default:
        return null;
    }
  };

  return (
    <button className={`btn btn-${type}`} onClick={onClick} disabled={disabled}>
      {getIcon()} </button>
  );
};

export default Buttons;
