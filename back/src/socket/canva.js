function onDraw(socket, io, gameState) {
    if (gameState.isGameRunning && socket.id === gameState.drawerSocketId) {
        io.broadcast.emit('draw', data);
    }
};

function onClear(socket, io, gameState) {
    if (gameState.isGameRunning && socket.id === gameState.drawerSocketId) {
        io.emit('clear_canvas');
    }
};


module.exports = { onDraw, onClear };