import React from "react";
import "./WarningPopup.css"; // style this file however you want

interface WarningPopupProps {
  message: string;
  onClose: () => void;
}

const WarningPopup: React.FC<WarningPopupProps> = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <button onClick={onClose} className="popup-close-btn">
          Close
        </button>
      </div>
    </div>
  );
};

export default WarningPopup;
