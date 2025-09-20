import React, { useState } from 'react';

function ClaimBanner({ claim }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: claim.status || 'Submitted',
    damage_description: claim.damage_description || '',
    vehicle: claim.vehicle || ''
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#28a745';
      case 'in review': return '#ffc107';
      case 'submitted': return '#17a2b8';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="chat-message claim-status-message">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <strong style={{ fontSize: '16px', color: '#343a40' }}>Claim Details</strong>
        <span style={{
          backgroundColor: getStatusColor(claim.status),
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {claim.status || 'Submitted'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div>
          <span style={{ color: '#6c757d', fontSize: '12px' }}>Claim ID:</span>
          <div style={{ fontWeight: 'bold', color: '#343a40' }}>{claim.claim_id || 'N/A'}</div>
        </div>
        <div>
          <span style={{ color: '#6c757d', fontSize: '12px' }}>Last Updated:</span>
          <div style={{ fontWeight: 'bold', color: '#343a40' }}>
            {claim.last_updated ? new Date(claim.last_updated).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#6c757d', display: 'block', marginBottom: '4px' }}>Status:</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              style={{ width: '100%', padding: '6px', border: '1px solid #dee2e6', borderRadius: '4px' }}
            >
              <option value="Submitted">Submitted</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#6c757d', display: 'block', marginBottom: '4px' }}>Vehicle:</label>
            <input
              type="text"
              value={editForm.vehicle}
              onChange={(e) => setEditForm({...editForm, vehicle: e.target.value})}
              style={{ width: '100%', padding: '6px', border: '1px solid #dee2e6', borderRadius: '4px' }}
              placeholder="Vehicle details"
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#6c757d', display: 'block', marginBottom: '4px' }}>Damage Description:</label>
            <textarea
              value={editForm.damage_description}
              onChange={(e) => setEditForm({...editForm, damage_description: e.target.value})}
              style={{ width: '100%', padding: '6px', border: '1px solid #dee2e6', borderRadius: '4px', minHeight: '60px' }}
              placeholder="Describe the damage"
            />
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
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#6c757d', fontSize: '12px' }}>Vehicle:</span>
            <div style={{ fontWeight: 'bold', color: '#343a40' }}>{claim.vehicle || 'N/A'}</div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#6c757d', fontSize: '12px' }}>Damage Description:</span>
            <div style={{ color: '#343a40', fontSize: '14px' }}>
              {claim.damage_description || 'No description provided'}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>
              {claim.photos && claim.photos.length > 0 ? `${claim.photos.length} photo(s) attached` : 'No photos attached'}
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
              Edit Claim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClaimBanner;
