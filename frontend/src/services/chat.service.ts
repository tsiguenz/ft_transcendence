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
    console.log("BEFORE");
    this.socketService.send("joinRoom", { chatroomId: chatroomId });
    console.log("SUCCESS");
  }
}

export default new ChatService();
