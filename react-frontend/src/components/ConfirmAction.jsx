import React, { useEffect } from 'react';

function ConfirmAction({ text, onConfirm, onCancel }) {
  useEffect(() => {
    console.log("ConfirmAction skeleton loaded");
  }, []);

  return (
    <div className="chat-message confirm-action-message">
      <strong>Confirmation:</strong>
      <p>{text}</p>
      <div className="confirm-action-buttons">
        <button onClick={onConfirm}>Yes</button>
        <button onClick={onCancel}>No</button>
      </div>
    </div>
  );
}

export default ConfirmAction;
