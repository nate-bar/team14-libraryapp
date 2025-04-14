import React from 'react';
import './confirmationmodal.css';

type ConfirmationModalProps = {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-buttons">
          <button onClick={onConfirm} className="confirm-button">
            Confirm
          </button>
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;