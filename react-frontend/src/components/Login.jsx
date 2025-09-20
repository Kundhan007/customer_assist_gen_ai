import React, { useState } from 'react';
import logger from '../utils/logger';
import './Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      logger.info('🔐 Attempting login with:', { email, password: '***' });
      
      // Make API call to /auth/login
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      logger.info('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        logger.info('✅ Login successful, received data:', data);
        const token = data.access_token;
        logger.info('🎫 Token received, calling onLogin...');
        onLogin(token);
      } else {
        const errorData = await response.json();
        logger.error('❌ Login failed:', errorData);
        setError(errorData.message || 'Login failed');
      }
    } catch (err) {
      logger.error('🚨 Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>
            Customer Assist
          </h2>
          <p style={{ margin: '0', fontSize: '16px', opacity: '0.9' }}>
            AI-Powered Insurance Support
          </p>
        </div>

        <h3 style={{ 
          textAlign: 'center', 
          marginBottom: '24px', 
          color: '#343a40',
          fontSize: '20px',
          fontWeight: '500'
        }}>
          Welcome Back
        </h3>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading || !email || !password}
            style={{
              opacity: (isLoading || !email || !password) ? 0.6 : 1,
              cursor: (isLoading || !email || !password) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e9ecef',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>Demo Credentials:</p>
          <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '12px' }}>
            Email: {process.env.REACT_APP_DEMO_EMAIL}<br />
            Password: {process.env.REACT_APP_DEMO_PASSWORD}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
