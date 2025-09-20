import React, { useEffect } from 'react';

function ClaimStatusTable({ claim }) { // Changed prop from 'claims' (array) to 'claim' (object)
  useEffect(() => {
    console.log("ClaimStatusTable skeleton loaded");
  }, []);

  return (
    <div className="chat-message claim-status-message">
      <strong>Claim Status:</strong>
      <table>
        <tbody>
          <tr>
            <td>ID:</td>
            <td>{claim.claim_id || 'N/A'}</td>
          </tr>
          <tr>
            <td>Status:</td>
            <td>{claim.status || 'N/A'}</td>
          </tr>
          <tr>
            <td>Updated:</td>
            <td>{claim.last_updated || 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ClaimStatusTable;
