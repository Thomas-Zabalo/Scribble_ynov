import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/game');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <h1>Scribble Ynov</h1>
      <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '18px' }}>
        Se connecter
      </button>
    </div>
  );
};

export default LoginPage;
