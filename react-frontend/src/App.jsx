import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Chat from './pages/Chat';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    console.log("App skeleton loaded");
  }, []);

  return (
    <div className="App">
      {token ? (
        <Chat token={token} />
      ) : (
        <Login onLogin={setToken} />
      )}
    </div>
  );
}

export default App;
