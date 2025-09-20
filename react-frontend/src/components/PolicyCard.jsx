import React, { useState } from 'react';

function PolicyCard({ policy }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    deductible: policy.deductible || '500',
    roadside_assistance: policy.roadside_assistance || false
  });

  const getStatusColor = (planName) => {
    return planName === 'Gold' ? '#28a745' : '#6c757d';
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="chat-message policy-card-message">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <strong style={{ fontSize: '16px', color: '#343a40' }}>Policy Information</strong>
        <span style={{
          backgroundColor: getStatusColor(policy.plan_name),
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {policy.plan_name || 'Silver'}
        </span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div>
          <span style={{ color: '#6c757d', fontSize: '12px' }}>Coverage:</span>
          <div style={{ fontWeight: 'bold', color: '#343a40' }}>${policy.collision_coverage || '50,000'}</div>
        </div>
        <div>
          <span style={{ color: '#6c757d', fontSize: '12px' }}>Premium:</span>
          <div style={{ fontWeight: 'bold', color: '#343a40' }}>${policy.premium || '1,200'}/yr</div>
        </div>
      </div>

      {isEditing ? (
        <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#6c757d', display: 'block', marginBottom: '4px' }}>Deductible:</label>
            <input
              type="number"
              value={editForm.deductible}
              onChange={(e) => setEditForm({...editForm, deductible: e.target.value})}
              style={{ width: '100%', padding: '6px', border: '1px solid #dee2e6', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
              <input
                type="checkbox"
                checked={editForm.roadside_assistance}
                onChange={(e) => setEditForm({...editForm, roadside_assistance: e.target.checked})}
                style={{ marginRight: '6px' }}
              />
              Roadside Assistance
            </label>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} style={{ 
              flex: 1, 
              padding: '6px', 
              background: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Save
            </button>
            <button onClick={() => setIsEditing(false)} style={{ 
              flex: 1, 
              padding: '6px', 
              background: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#6c757d', fontSize: '12px' }}>Deductible:</span>
            <div style={{ fontWeight: 'bold', color: '#343a40' }}>${policy.deductible || '500'}</div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            style={{ 
              padding: '6px 12px', 
              background: '#4a90e2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default PolicyCard;
