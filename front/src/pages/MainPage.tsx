import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import Canvas from '../components/Canvas';
import ScoreBoard from '../components/ScoreBoard';
import { socket } from '../services/socket';

const MainPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Récupération des infos de connexion (venant de LoginPage)
  // Si pas d'infos, on considère que c'est un invité par défaut (ou on redirige)
  const { username, isGuest } = location.state || { username: `Guest_${Math.floor(Math.random() * 1000)}`, isGuest: true };

  const [targetWord, setTargetWord] = useState<string | null>(null);
  const [isDrawer, setIsDrawer] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [players, setPlayers] = useState<{name: string, score: number}[]>([]);

  useEffect(() => {
    // Connexion au socket
    socket.auth = { username, isGuest };
    socket.connect();

    // Listeners globaux
    socket.on('game_state', (state: any) => {
      setGameStatus(state.status);
      if (state.drawerId === socket.id) {
        setIsDrawer(true);
      } else {
        setIsDrawer(false);
      }
    });

    socket.on('round_start', (data: { word?: string, drawerId: string }) => {
      setGameStatus('playing');
      setIsDrawer(socket.id === data.drawerId);
      if (socket.id === data.drawerId) {
        setTargetWord(data.word || null);
      } else {
        setTargetWord(null); // Les autres ne voient pas le mot
      }
    });

    socket.on('round_end', () => {
      setGameStatus('finished');
      setTargetWord(null);
      setIsDrawer(false);
    });

    socket.on('update_players', (playerList: any[]) => {
      setPlayers(playerList);
    });

    return () => {
      socket.off('game_state');
      socket.off('round_start');
      socket.off('round_end');
      socket.off('update_players');
      socket.disconnect();
    };
  }, [username, isGuest]);

  // Fonction pour lancer la manche (réservée admin/serveur normalement, ici simulation via bouton)
  const requestStartRound = () => {
    socket.emit('start_round');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#000000',
      color: '#ffffff',
      boxSizing: 'border-box'
    }}>
      <header style={{ 
        padding: '10px 20px', 
        backgroundColor: '#1a1a1a', 
        borderBottom: '1px solid #333',
        textAlign: 'center',
        zIndex: 10
      }}>
        {/* En-tête dynamique selon le statut */}
        {gameStatus === 'waiting' && (
          <div>
            <span style={{ marginRight: '10px' }}>En attente de joueurs...</span>
            {!isGuest && (
              <button onClick={requestStartRound} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Lancer la partie
              </button>
            )}
          </div>
        )}

        {gameStatus === 'playing' && (
          <h2 style={{ margin: 0, color: '#ffffff' }}>
            {isDrawer ? `MOT À DESSINER : ${targetWord}` : "DEVINEZ LE DESSIN !"}
          </h2>
        )}

        {gameStatus === 'finished' && (
          <h2 style={{ margin: 0, color: '#ffffff' }}>Manche terminée !</h2>
        )}
      </header>

      <main style={{ 
        display: 'flex', 
        flex: 1, 
        padding: '20px', 
        gap: '20px', 
        overflow: 'hidden'
      }}>
        <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column' }}>
          <Chat 
            username={username}
            isDrawer={isDrawer} 
            isGuest={isGuest}
          />
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
          <Canvas isDrawer={isDrawer && !isGuest} />
        </div>
        
        <div style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column' }}>
          <ScoreBoard players={players} />
        </div>
      </main>
    </div>
  );
};

export default MainPage;
