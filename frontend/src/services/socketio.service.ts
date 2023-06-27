import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents
} from '@/types/Socket';

class SocketioService {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  constructor(url: string) {
    this.url = url;
    this.socket = null;
  }

  setupSocketConnection(jwt: string) {
    this.socket = io(this.url, { auth: { token: jwt } });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  send(event: string, message: string) {
    console.log('=== SOCKET IO SERVICE SEND');
    console.log('=== Socket: ' + !!this.socket);
    if (!this.socket) return;
    this.socket.emit(event, message);
  }

  subscribe(event: string, callback: Function) {
    if (!this.socket) return;
    this.socket.on(event, (message) => {
      return callback(message);
    });
  }

  unsubscribe(event: string) {
    if (!this.socket) return;
    this.socket.off(event);
  }
}

export default SocketioService;
