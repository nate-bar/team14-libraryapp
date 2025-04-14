// app/components/buttons/AlertPopup.tsx
import React from "react";
import "./AlertPopup.css";

interface AlertPopupProps {
  message: string;
  onClose: () => void;
  // adding type here in interface to get rid of type errors in edit and insert pages
  type?: "success" | "error";
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
