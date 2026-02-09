import React from 'react';

const ScoreBoard: React.FC = () => {
  const scores = [
    { name: 'Player 1', score: 100 },
    { name: 'Player 2', score: 80 },
    { name: 'Player 3', score: 60 },
  ];

  return (
    <div style={{ border: '1px solid black', padding: '10px', height: '400px' }}>
      <h3>Scoreboard</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {scores.map((player, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            {player.name}: {player.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScoreBoard;
