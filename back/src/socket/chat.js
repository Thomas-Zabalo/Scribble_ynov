function createMessage(msg) {
    const user = users.get(socket.id);
    if (!user) return;
    if (!msg || msg.trim().length === 0) return;

    const text = msg.trim();

    io.emit('public_message', { from: user.username, text: text });
}

module.exports = { createMessage };