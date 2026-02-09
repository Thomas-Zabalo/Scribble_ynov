import { io, Socket } from 'socket.io-client';

// URL du backend (à changer en production)
const SOCKET_URL = 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // On connectera manuellement après avoir récupéré le pseudo
});
