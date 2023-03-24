import { io, Socket } from 'socket.io-client';
import { CHAT_SOCKET_URL } from '../constants';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/Socket';

class SocketioService {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  constructor() {}

  setupSocketConnection(jwt: string) {
    this.socket = io(CHAT_SOCKET_URL, { auth: { token: jwt } } );
  }

  disconnect() {
    if (this.socket) { this.socket.disconnect(); }
  }

  send(event: string, message: string) {
    console.log(message)
    this.socket.emit(event, message);
  }

  subscribe(event: string, callback: Function) {
    if (!this.socket) return(true);
    this.socket.on(event, message => {
      return callback(message);
    });
  }
}

export default SocketioService;
