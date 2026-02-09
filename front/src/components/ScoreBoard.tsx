import React from 'react';

interface Player {
  name: string;
  score: number;
}

interface ScoreBoardProps {
  players: Player[];
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ players }) => {
  return (
    <div style={{ 
      border: '1px solid #333', 
      borderRadius: '8px',
      padding: '15px', 
      height: '100%', 
      backgroundColor: '#1a1a1a',
      color: 'white',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>Joueurs</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {players.map((player, index) => (
          <li key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '10px', 
            marginBottom: '8px',
            backgroundColor: index === 0 ? '#4a4100' : '#2a2a2a',
            borderRadius: '5px',
            fontWeight: index === 0 ? 'bold' : 'normal',
            border: '1px solid #444',
            color: 'white'
          }}>
            <span>{index + 1}. {player.name}</span>
            <span>{player.score} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScoreBoard;
