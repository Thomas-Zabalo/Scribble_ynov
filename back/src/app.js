const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");

const canva = require('./socket/canva');
const app = express();

const allowedOrigins = [
    "*",
];

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

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