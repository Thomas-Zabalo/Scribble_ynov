const socket = require("socket.io");
const app = require("../app.js");

function createRoom(io) {
        socket.join(roomId);
        console.log(`Client ${socket.id} joined room ${roomId}`);
}
function leaveRoom(io) {
        socket.leave(roomId);
        console.log(`Client ${socket.id} left room ${roomId}`);
}
module.exports = { createRoom, leaveRoom };


