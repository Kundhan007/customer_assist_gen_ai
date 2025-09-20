import React, { useState, useEffect } from 'react';
import ChatMessage from '../components/ChatMessage';
import PolicyCard from '../components/PolicyCard';
import ClaimStatusTable from '../components/ClaimStatusTable';
import ConfirmAction from '../components/ConfirmAction';
import '../components/Chat.css'; // Reusing the existing CSS

function Chat({ token }) {
  const [messages, setMessages] = useState([
    { type: "text", sender: "system", message: "Welcome to Customer Assist!" },
    { type: "policy", sender: "system", data: { plan: "Gold", coverage: "50000", deductible: "500" } },
    { type: "claim", sender: "system", data: { claim_id: "98765", status: "In Review", last_updated: "2024-12-01" } },
    { type: "confirm", sender: "system", data: { text: "Proceed with claim check?" } }
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    console.log("Chat page skeleton loaded");
  }, []);

  const handleSend = () => {
    if (input.trim() !== '') {
      const newMessage = {
        type: "text",
        sender: "user",
        message: input,
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const renderMessage = (msg, index) => {
    switch (msg.type) {
      case "text":
        return <ChatMessage key={index} sender={msg.sender} message={msg.message} />;
      case "policy":
        return <PolicyCard key={index} policy={msg.data} />;
      case "claim":
        // ClaimStatusTable now expects a single claim object
        return <ClaimStatusTable key={index} claim={msg.data} />;
      case "confirm":
        // ConfirmAction now expects text and onConfirm/onCancel handlers
        return (
          <ConfirmAction
            key={index}
            text={msg.data.text}
            onConfirm={() => alert(`Confirmed: ${msg.data.text}`)}
            onCancel={() => alert(`Cancelled: ${msg.data.text}`)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat Page</h2>
      <p>Welcome! You are now logged in.</p>
      <p>Your token is: <strong>{token}</strong></p>

      <div className="chat-messages">
        {messages.map((msg, index) => renderMessage(msg, index))}
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
    </div>
  );
}

export default Chat;
