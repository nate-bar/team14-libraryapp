import React from "react";
import "./AlertPopup.css";

interface AlertPopupProps {
  message: string;
  onClose: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p className="popup-message">{message}</p>
        <button className="popup-close-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default AlertPopup;
