import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim()) {
      navigate('/game', { state: { username, isGuest: false } });
    }
  };

  const handleGuestLogin = () => {
    const guestName = `Guest_${Math.floor(Math.random() * 1000)}`;
    navigate('/game', { state: { username: guestName, isGuest: true } });
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const boxStyle: React.CSSProperties = {
    backgroundColor: '#1a1a1a',
    padding: '40px',
    borderRadius: '16px',
    border: '1px solid #333',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '380px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #444',
    backgroundColor: '#000',
    color: 'white',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2196F3',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#333',
    color: 'white',
    border: '1px solid #444',
  };

  return (
    <div id="login-container" style={containerStyle}>
      <div className="login-box" style={boxStyle}>
        <h2 style={{ marginBottom: '30px' }}>Scribble Ynov</h2>
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
