import React, { useEffect } from 'react';

function ChatMessage({ sender, message }) {
  useEffect(() => {
    console.log("ChatMessage skeleton loaded");
  }, []);

  return (
    <div className="chat-message text-message">
      <strong>{sender}: </strong>
      {message}
    </div>
  );
}

export default ChatMessage;
