import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/Socket';

class SocketioService {
  socket!: Socket<ServerToClientEvents, ClientToServerEvents>;
  constructor() {}

  setupSocketConnection() {
    this.socket = io(SOCKET_URL);
  }

  disconnect() {
    if (this.socket) {
        this.socket.disconnect();
    }
  }
}

export default new SocketioService();
