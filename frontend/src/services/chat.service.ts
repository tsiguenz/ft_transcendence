import SocketioService from './socketio.service';
import * as events from '@/socketioEvents';
import { useChatStore } from '@/store/chat';
import { CHAT_SOCKET_URL } from '@/constants';

class ChatService {
  constructor(
    private socketService: SocketioService = new SocketioService(
      CHAT_SOCKET_URL
    ),
    private chatStore: useChatStore = useChatStore()
  ) {}

  setup(jwt: string) {
    this.socketService.setupSocketConnection(jwt);
  }

  disconnect() {
    this.socketService.disconnect();
  }

  sendMessage(message: string) {
    this.socketService.send(events.MESSAGE_TO_SERVER, message);
  }

  subscribeToMessages(callback: Function) {
    this.socketService.subscribe(events.MESSAGE_TO_CLIENT, callback);
  }

  subscribeToKick(callback: Function) {
    this.socketService.subscribe(events.KICKED_FROM_ROOM, callback);
  }

  joinRoom(chatroomId: number) {
    this.socketService.send(events.JOIN_ROOM, { chatroomId: chatroomId });
  }

  leaveRoom(chatroomId: number) {
    this.socketService.send(events.LEAVE_ROOM, { chatroomId: chatroomId });
  }

  deleteRoom(chatroomId: number) {
    this.socketService.send(events.DELETE_ROOM, { chatroomId: chatroomId });
  }

  getRoomMessages(chatroomId: number, newerThan: Date = new Date(null)) {
    this.socketService.send(events.GET_MESSAGES, {
      chatroomId: chatroomId,
      newerThan: newerThan
    });
  }

  storeMessage(message: string) {
    this.chatStore.storeMessage(message);
  }

  storeUser(payload: string) {
    this.chatStore.storeUser(payload);
  }

  removeUserFromRoom(payload: string) {
    this.chatStore.removeUser(payload);
  }

  muteUser(userId: string, chatroomId: string, time: number) {
    this.socketService.send(events.RESTRICT_USER, { userId, chatroomId, restrictionType: 'MUTED', time });
  }

  banUser(userId: string, chatroomId: string, time: number) {
    this.socketService.send(events.RESTRICT_USER, { userId, chatroomId, restrictionType: 'BANNED', time });
  }
}

export default new ChatService();
