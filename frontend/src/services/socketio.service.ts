import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/Socket';

class SocketioService {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  constructor() {}

  setupSocketConnection() {
    this.socket = io(SOCKET_URL);
    this.socket.emit('msgToServer', 'Hello there from Vue.');
  }

  disconnect() {
    if (this.socket) {
        this.socket.disconnect();
    }
  }

  sendMessage(event: string, message: string) {
    this.socket.emit(event, message);
  }

  subscribe(event: string, callback: Function) {
    if (!this.socket) return(true);
    this.socket.on(event, message => {
      return callback(message);
    });
  }
}

export default new SocketioService();
