import React, { useState, useEffect } from 'react';
import ChatMessage from '../components/ChatMessage';
import '../components/Chat.css';

function Chat({ token }) {
  const [messages, setMessages] = useState([
    { 
      type: "text", 
      sender: "system", 
      message: "Welcome to Customer Assist! I'm your AI-powered insurance assistant. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("🤖 Chat page loaded with token:", token ? "TOKEN_PRESENT" : "NO_TOKEN");
  }, [token]);

  const handleSend = async () => {
    if (input.trim() !== '') {
      const userMessage = {
        type: "text",
        sender: "user",
        message: input,
      };
      setMessages([...messages, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        console.log("📡 Sending message to backend:", input);
        
        // Make actual API call to the backend
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chat/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            message: input,
            sessionId: "demo-session" // This should come from user data after auth
          }),
        });

        console.log("📡 Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Backend response:", data);
          
          const botResponse = {
            type: "text",
            sender: "system",
            message: data.response || "I received your message and I'm here to help!"
          };
          setMessages(prev => [...prev, botResponse]);
        } else {
          console.log("❌ Backend request failed");
          const botResponse = {
            type: "text",
            sender: "system",
            message: "I'm having trouble connecting to my backend right now. Please try again later."
          };
          setMessages(prev => [...prev, botResponse]);
        }
      } catch (error) {
        console.log("🚨 Error calling backend:", error);
        const botResponse = {
          type: "text",
          sender: "system",
          message: "Sorry, I'm experiencing technical difficulties. Please try again."
        };
        setMessages(prev => [...prev, botResponse]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (msg, index) => {
    switch (msg.type) {
      case "text":
        return <ChatMessage key={index} sender={msg.sender} message={msg.message} />;
      default:
        return null;
    }
  };

  return (
    <div className="chat-container">
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px', 
        padding: '16px', 
        background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Customer Assist</h2>
        <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
          Your AI-powered insurance assistant
        </p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => renderMessage(msg, index))}
        {isLoading && (
          <div className="chat-message system">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#4a90e2', 
                borderRadius: '50%',
                animation: 'pulse 1.4s infinite ease-in-out'
              }}></div>
              <span style={{ color: '#1565c0', fontSize: '14px' }}>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your policies, claims, or coverage..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || input.trim() === ''}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Chat;
