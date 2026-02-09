function createRoom(io,socket, roomId) {
        socket.join(roomId);
        console.log(`Client ${socket.id} joined room ${roomId}`);
}
function leaveRoom(io, socket, roomId) {
        socket.leave(roomId);
        console.log(`Client ${socket.id} left room ${roomId}`);
}
module.exports = { createRoom, leaveRoom };


