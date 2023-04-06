import SocketioService from './socketio.service';
import { useChatStore } from '@/store/chat';

class ChatService {
  constructor(
    private socketService: SocketioService = new SocketioService(),
    private chatStore: useChatStore = useChatStore()
  ) {}

  setup(jwt: string) {
    this.socketService.setupSocketConnection(jwt);
  }

  disconnect() {
    this.socketService.disconnect();
  }

  sendMessage(message: string) {
    this.socketService.send('msgToServer', message);
  }

  subscribeToMessages(callback: Function) {
    this.socketService.subscribe('msgToClient', callback);
  }

  joinRoom(chatroomId: number) {
    this.socketService.send('joinRoom', { chatroomId: chatroomId });
  }

  getRoomMessages(chatroomId: number, newerThan: Date = new Date(null)) {
    this.socketService.send('getRoomMessages', {
      chatroomId: chatroomId,
      newerThan: newerThan
    });
  }

  storeMessage(message: string) {
    this.chatStore.storeMessage(message);
  }
}

export default new ChatService();
