const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");

const {createRoom,leaveRoom} = require('./socket/room');
const canva = require('./socket/canva');
const { addUser, removeUser, getUsersInRoom } = require('./socket/user');
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

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

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
});

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

module.exports = { app, server, gameState };