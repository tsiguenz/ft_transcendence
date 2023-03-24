import SocketioService from './socketio.service';

class ChatService {
  constructor(private socketService: SocketioService = new SocketioService()) {}

  setup(jwt: string) {
    this.socketService.setupSocketConnection(jwt);
  }

  disconnect() {
    this.socketService.disconnect();
  }

  sendMessage(message: string) {
    this.socketService.send("msgToServer", message);
  }

  subscribeToMessages(callback: Function) {
    this.socketService.subscribe("msgToClient", callback);
  }

  joinRoom(chatroomId: number) {
    this.socketService.send("joinRoom", { chatroomId: chatroomId });
  }

  getRoomMessages(chatroomId: number, newerThan: Date = new Date(null)) {
    this.socketService.send("getRoomMessages", { chatroomId: chatroomId, newerThan: newerThan });
  }
}

export default new ChatService();
