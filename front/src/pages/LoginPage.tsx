import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim()) {
      // Logic for logging in with username
      console.log('Logging in as:', username);
      navigate('/game'); // Assuming chat is the next page, or game as before
    }
  };

  const handleGuestLogin = () => {
    // Logic for guest login
    console.log('Logging in as guest');
    navigate('/game');
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #e0eaFC 0%, #cfdef3 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const boxStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '380px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #e1e4e8',
    backgroundColor: '#f8f9fa',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'white',
    color: '#3b82f6',
    border: '2px solid #3b82f6',
  };

  return (
    <div id="login-container" style={containerStyle}>
      <div className="login-box" style={boxStyle}>
        <h2>Bienvenue sur WebSocket Chat</h2>
        <input
          type="text"
          id="username-input"
          placeholder="Entrez votre pseudo..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />
        <div className="login-actions">
          <button id="login-btn" onClick={handleLogin} style={buttonStyle}>Se connecter</button>
          <button id="guest-btn" className="secondary" onClick={handleGuestLogin} style={secondaryButtonStyle}>Mode Invité</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
