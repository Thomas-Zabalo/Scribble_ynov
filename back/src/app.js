const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");

const { createRoom, leaveRoom } = require('./socket/room');
const canva = require('./socket/canva');
const { addUser, removeUser, getUsersInRoom } = require('./socket/user');
const messagePlayer = require('./socket/chat');

const path = require('path');
const fs = require('fs');
const app = express();

const allowedOrigins = [
    "*",
];

const server = http.createServer(app);
const io = new Server(server);

let gameState = {
    isGameRunning: false,
    drawerSocketId: null,
    currentWord: null,
    roundEndTime: null
};

const dataFilePath = path.join(__dirname, '../data/data.json');
const WORDS = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy: origin not allowed"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());


function startNewRound() {
    const loggedSockets = Array.from(users.entries())
        .filter(([id, u]) => u.isLogged)
        .map(([id, u]) => id);

    if (loggedSockets.length < 1) {
        gameState.isGameRunning = false;
        gameState.drawerSocketId = null;
        gameState.currentWord = null;
        io.emit('game_status', { status: 'En attente', message: 'En attente de joueurs...' });
        return;
    }

    const randomDrawerIndex = Math.floor(Math.random() * loggedSockets.length);
    gameState.drawerSocketId = loggedSockets[randomDrawerIndex];

    gameState.currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    gameState.isGameRunning = true;

    const drawerUser = users.get(gameState.drawerSocketId);

    io.emit('clear_canvas');
    io.emit('round_start', {
        drawer: drawerUser.username,
        drawerId: gameState.drawerSocketId
    });

    io.to(gameState.drawerSocketId).emit('your_turn', { word: gameState.currentWord });

    io.emit('game_message', { type: 'info', text: `Nouveau round! ${drawerUser.username} dessine.` });

    console.log(`Le round commande. Dessinateur: ${drawerUser.username}, Mot: ${gameState.currentWord}`);
}


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    if (!gameState.isGameRunning) {
        startNewRound();
    }

    socket.on('join_room', (roomId) => {
        createRoom(io, socket, roomId);
        addUser(socket.id, {
            socketId: socket.id,
            username,
            roomId,
            score: 0
        });
        io.to(roomId).emit("players_update", getUsersInRoom(roomId));
    });

    socket.on('leave_room', (roomId) => {
        leaveRoom(io, socket, roomId);
        removeUser(socket.id);
    });

    socket.on('draw', (data) => {
        canva.onDraw(socket, io, gameState);
    });

    socket.on('clear_canvas', () => {
        canva.onClear(socket, io, gameState);
    });

    socket.on('public_message', (msg) => {
        messagePlayer.createMessage(msg);
    })

    if (gameState.isGameRunning &&
        socket.id !== gameState.drawerSocketId &&
        gameState.currentWord &&
        text.toUpperCase() === gameState.currentWord.toUpperCase()) {

        user.score += 10;
        const drawer = users.get(gameState.drawerSocketId);
        if (drawer) drawer.score += 5;

        io.emit('game_message', { type: 'success', text: `${user.username} à trouvé le mot: ${gameState.currentWord}!` });
        broadcastUserList();

        gameState.isGameRunning = false;
        gameState.currentWord = null;
        gameState.drawerSocketId = null;

        setTimeout(() => {
            startNewRound();
        }, 3000);
    }
});

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

module.exports = { app, server, gameState };