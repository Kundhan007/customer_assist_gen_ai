import React, { useEffect } from 'react';

function PolicyCard({ policy }) {
  useEffect(() => {
    console.log("PolicyCard skeleton loaded");
  }, []);

  return (
    <div className="chat-message policy-card-message">
      <strong>Policy Info:</strong>
      <p>Plan: {policy.plan || 'N/A'}</p>
      <p>Coverage: ${policy.coverage || 'N/A'}</p>
      <p>Deductible: ${policy.deductible || 'N/A'}</p>
    </div>
  );
}

export default PolicyCard;
