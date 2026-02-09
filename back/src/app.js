const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");

const room = require('./socket/room');
const canva = require('./socket/canva');
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

const WORDS = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/data.json'), 'utf-8'));

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

    socket.on('draw', () => {
    socket.on('join_room', (roomId) => {
        room.createRoom(io, socket, roomId);
    });

    socket.on('leave_room', (roomId) => {
        room.leaveRoom(io, socket, roomId);
    });

    socket.on('draw', (data) => {
        canva.onDraw(socket, io, gameState);
    });

    socket.on('clear_canvas', () => {
        canva.onClear(socket, io, gameState);
    });
});

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

module.exports = { app, server, gameState };