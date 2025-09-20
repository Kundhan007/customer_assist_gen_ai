import React, { useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import PolicyCard from './PolicyCard';
import ClaimStatusTable from './ClaimStatusTable';
import ConfirmAction from './ConfirmAction';
import './Chat.css'; // Import the CSS file

function Chat({ token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    console.log("Chat page skeleton loaded");
  }, []);

  const handleSend = () => {
    if (input.trim() !== '') {
      // In a real app, this would send the message to a backend
      // For now, we'll just add it to the messages array locally
      const newMessage = { id: Date.now(), text: input, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Dummy data for stub components, based on SQL schema
  const dummyPolicy = {
    policy_id: 'POL-1001',
    user_id: '11111111-1111-1111-1111-111111111111',
    plan_name: 'Gold',
    collision_coverage: 50000,
    roadside_assistance: true,
    deductible: 500,
    premium: '500.00',
    created_at: '2023-01-15T10:00:00Z'
  };

  const dummyClaims = [
    { claim_id: '98765', policy_id: 'POL-1001', status: 'In Review', damage_description: 'Rear-end collision at traffic light', vehicle: '2022 Toyota Camry', last_updated: '2024-12-01T12:00:00Z' },
    { claim_id: '54321', policy_id: 'POL-1001', status: 'Submitted', damage_description: 'Side mirror damage in parking lot', vehicle: '2022 Toyota Camry', last_updated: '2025-01-05T14:30:00Z' },
  ];

  const dummyClaimDetailsForConfirmation = {
    claim_id: 'NEW-001',
    policy_id: 'POL-1001',
    damage_description: 'Minor scratch on the door',
    vehicle: '2022 Toyota Camry',
  };

  const handleConfirm = () => {
    alert('Claim submission confirmed!');
  };

  const handleCancel = () => {
    alert('Claim submission cancelled.');
  };

  return (
    <div className="chat-container">
      <h2>Chat Page</h2>
      <p>Welcome! You are now logged in.</p>
      <p>Your token is: <strong>{token}</strong></p>

      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>

      <div className="stub-components">
        <h3>Stub Components</h3>
        <div className="policy-card">
          <PolicyCard policy={dummyPolicy} />
        </div>
        <div className="claim-status-table">
          <ClaimStatusTable claims={dummyClaims} />
        </div>
        <div className="confirm-action">
          <ConfirmAction 
            claimDetails={dummyClaimDetailsForConfirmation}
            onConfirm={handleConfirm} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;
