import React, { useState } from 'react';

function ConfirmAction({ text, onConfirm, onCancel }) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
    onConfirm();
  };

  const handleCancel = () => {
    setIsConfirmed(true);
    onCancel();
  };

  if (isConfirmed) {
    return (
      <div className="chat-message confirm-action-message" style={{
        background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
        border: '1px solid #c3e6cb',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#28a745',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
          <span style={{ color: '#155724', fontSize: '14px', fontWeight: '500' }}>
            Action completed successfully
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-message confirm-action-message">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: '#4a90e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          flexShrink: 0
        }}>
          ?
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: '600', 
            color: '#343a40', 
            marginBottom: '6px',
            fontSize: '14px'
          }}>
            Action Required
          </div>
          <p style={{ 
            margin: '0', 
            color: '#495057', 
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {text}
          </p>
        </div>
      </div>
      
      <div className="confirm-action-buttons">
        <button 
          onClick={handleConfirm}
          style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          ✓ Confirm
        </button>
        <button 
          onClick={handleCancel}
          style={{
            background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(108, 117, 125, 0.2)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}

export default ConfirmAction;
