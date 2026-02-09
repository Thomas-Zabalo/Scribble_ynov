import React from 'react';
import Chat from '../components/Chat';
import Canvas from '../components/Canvas';
import ScoreBoard from '../components/ScoreBoard';

const MainPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', gap: '10px' }}>
      <div style={{ flex: 1 }}>
        <Chat />
      </div>
      <div style={{ flex: 2 }}>
        <Canvas />
      </div>
      <div style={{ flex: 1 }}>
        <ScoreBoard />
      </div>
    </div>
  );
};

export default MainPage;
