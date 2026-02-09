import { io, Socket } from 'socket.io-client';

// URL du backend (port 4000 selon votre configuration)
const SOCKET_URL = 'http://localhost:4000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // On connectera manuellement après avoir récupéré le pseudo
});
