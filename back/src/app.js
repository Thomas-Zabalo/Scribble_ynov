const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const path = require('path');
const fs = require('fs');

const { users, addUser, removeUser, getUser } = require('./socket/user');

const app = express();
const server = http.createServer(app);

// Configuration CORS pour Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

let gameState = {
    status: 'waiting', // 'waiting', 'playing', 'finished'
    drawerId: null,
    currentWord: null,
};

const dataFilePath = path.join(__dirname, '../data/data.json');
const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
const WORDS = data.words;

app.use(cors());
app.use(express.json());

function broadcastUserList() {
    const playerList = Array.from(users.values()).map(u => ({
        name: u.username,
        score: u.score || 0
    }));
    io.emit('update_players', playerList);
}

function startNewRound() {
    const activePlayers = Array.from(users.values()).filter(u => !u.isGuest);

    if (activePlayers.length < 2) {
        gameState.status = 'waiting';
        gameState.drawerId = null;
        gameState.currentWord = null;
        io.emit('game_state', gameState);
        io.emit('chat_message', { user: 'Système', text: 'En attente de plus de joueurs...', isSystem: true });
        return;
    }

    const randomDrawer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
    gameState.drawerId = randomDrawer.socketId;
    gameState.currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    gameState.status = 'playing';

    // Nettoyer le canvas pour tout le monde au début de la manche
    io.emit('clear_canvas');

    // Notifier tout le monde du début de la manche
    io.emit('round_start', { drawerId: gameState.drawerId });
    
    // Envoyer le mot seulement au dessinateur
    io.to(gameState.drawerId).emit('round_start', { 
        word: gameState.currentWord, 
        drawerId: gameState.drawerId 
    });

    io.emit('chat_message', { 
        user: 'Système', 
        text: `Une nouvelle manche commence ! ${randomDrawer.username} dessine.`, 
        isSystem: true 
    });
    
    broadcastUserList();
}

io.on('connection', (socket) => {
    const { username, isGuest } = socket.handshake.auth;
    
    console.log(`User connected: ${username} (${socket.id}) - Guest: ${isGuest}`);

    addUser(socket.id, {
        socketId: socket.id,
        username: username || `Guest_${socket.id.substring(0,4)}`,
        isGuest: !!isGuest,
        score: 0
    });

    broadcastUserList();
    socket.emit('game_state', gameState);

    socket.on('chat_message', (data) => {
        const user = getUser(socket.id);
        if (!user) return;

        const text = data.text.trim();
        if (!text) return;

        // Vérification du mot si le jeu est en cours et que ce n'est pas le dessinateur
        if (gameState.status === 'playing' && 
            socket.id !== gameState.drawerId && 
            gameState.currentWord &&
            text.toLowerCase() === gameState.currentWord.toLowerCase()) {
            
            user.score += 10;
            const drawer = getUser(gameState.drawerId);
            if (drawer) drawer.score += 5;

            io.emit('chat_message', { 
                user: 'Système', 
                text: `${user.username} a trouvé le mot : ${gameState.currentWord} !`, 
                isSystem: true 
            });
            
            gameState.status = 'finished';
            io.emit('round_end');
            broadcastUserList();

            setTimeout(() => {
                startNewRound();
            }, 5000);
        } else {
            // Message normal
            io.emit('chat_message', { user: user.username, text: text });
        }
    });

    socket.on('draw', (data) => {
        if (gameState.status === 'playing' && socket.id === gameState.drawerId) {
            socket.broadcast.emit('draw', data);
        }
    });

    socket.on('clear_canvas', () => {
        if (gameState.status === 'playing' && socket.id === gameState.drawerId) {
            io.emit('clear_canvas');
        }
    });

    socket.on('start_round', () => {
        const user = getUser(socket.id);
        if (user && !user.isGuest && gameState.status !== 'playing') {
            startNewRound();
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        removeUser(socket.id);
        
        if (socket.id === gameState.drawerId) {
            io.emit('chat_message', { user: 'Système', text: 'Le dessinateur est parti, manche annulée.', isSystem: true });
            gameState.status = 'waiting';
            gameState.drawerId = null;
            gameState.currentWord = null;
            io.emit('game_state', gameState);
        }
        
        broadcastUserList();
    });
});

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

module.exports = { app, server, gameState };