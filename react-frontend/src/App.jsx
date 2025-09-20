import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Chat from './pages/Chat';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    console.log("🏠 App component loaded, current token:", token ? "TOKEN_PRESENT" : "NO_TOKEN");
  }, [token]);

  const handleLogin = (receivedToken) => {
    console.log("🔄 handleLogin called with token:", receivedToken ? "TOKEN_RECEIVED" : "NO_TOKEN");
    console.log("🔄 Token length:", receivedToken ? receivedToken.length : 0);
    setToken(receivedToken);
    console.log("🔄 setToken called, new token state will be updated on next render");
  };

  return (
    <div className="App">
      {token ? (
        <Chat token={token} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
