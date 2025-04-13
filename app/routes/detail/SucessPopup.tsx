import React from "react";
import "app/components/buttons/AlertPopup.css";

interface SuccessPopupProps {
  message: string;
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, onClose }) => {
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

export default SuccessPopup;
