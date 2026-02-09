const users = new Map(); 

function addUser(socketId, user) {
    users.set(socketId, user);
}

function removeUser(socketId) {
    users.delete(socketId);
}

function getUser(socketId) {
    return users.get(socketId);
}

function getUsersInRoom(roomId) {
    return [...users.values()].filter(u => u.roomId === roomId);
}

module.exports = {
    users,
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
