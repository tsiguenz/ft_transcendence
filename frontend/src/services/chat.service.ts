import SocketioService from './socketio.service';
import * as events from '@/socketioEvents';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { CHAT_SOCKET_URL } from '@/constants';
import * as lib from '@/utils/lib';

class ChatService {
  constructor(
    private socketService: SocketioService = new SocketioService(
      CHAT_SOCKET_URL
    ),
    private chatStore: useChatStore = useChatStore(),
    private sessionStore: useSessionStore = useSessionStore()
  ) {}

  isSetup: boolean = false;

  setup(jwt: string, callback: Function) {
    this.socketService.setupSocketConnection(jwt);
    this.socketService.subscribe(events.EXCEPTION, callback);
    this.socketService.subscribe(events.CHATROOM_NEW, (payload: any) => {
      this.chatStore.addRoom(payload.chatroom);
    });
    this.socketService.subscribe(
      events.CHATROOM_USER_CONNECT,
      (payload: any) => {
        this.chatStore.addUserToRoom(payload.chatroomId, payload.chatroomUser);
      }
    );
    this.socketService.subscribe(
      events.CHATROOM_USER_DISCONNECT,
      (payload: any) => {
        this.chatStore.removeUserFromRoom(payload.chatroomId, payload.userId);
      }
    );
    this.socketService.subscribe(
      events.CHATROOM_RESTRICTED_USER,
      (payload: any) => {
        console.info(
          `RESTRICTED: [${payload.restrictionType}], until: ${payload.until}`
        );
      }
    );
    this.isSetup = true;
    // this.socketService.subscribe(events.EXCEPTION, callback);
  }

  disconnect() {
    this.socketService.disconnect();
    this.isSetup = false;
  }

  sendMessage(message: string) {
    this.socketService.send(events.MESSAGE_TO_SERVER, message);
  }

  subscribeToMessages(callback: Function) {
    this.socketService.subscribe(events.MESSAGE_TO_CLIENT, callback);
  }

  subscribeToNewRooms(callback: Function) {
    this.socketService.subscribe(events.CHATROOM_NEW, callback);
  }

  subscribeToKick(callback: Function) {
    this.socketService.subscribe(events.CHATROOM_KICKED, callback);
  }

  createRoom(payload: { name: string; type: string; password: string }) {
    this.socketService.send(events.CHATROOM_CREATE, payload);
  }

  joinRoom(payload: { chatroomId: string; password: string }) {
    this.socketService.send(events.CHATROOM_JOIN, payload);
  }

  connectRoom(chatroomId: number) {
    this.socketService.send(events.CHATROOM_CONNECT, {
      chatroomId: chatroomId
    });
  }

  leaveRoom(chatroomId: number) {
    this.socketService.send(events.CHATROOM_LEAVE, { chatroomId: chatroomId });
  }

  deleteRoom(chatroomId: number) {
    this.socketService.send(events.CHATROOM_DELETE, { chatroomId: chatroomId });
  }

  getRoomMessages(chatroomId: number, newerThan: Date = new Date(null)) {
    this.socketService.send(events.CHATROOM_GET_MESSAGES, {
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
    this.socketService.send(events.CHATROOM_RESTRICT_USER, {
      userId,
      chatroomId,
      restrictionType: 'MUTED',
      time
    });
  }

  banUser(userId: string, chatroomId: string, time: number) {
    this.socketService.send(events.CHATROOM_RESTRICT_USER, {
      userId,
      chatroomId,
      restrictionType: 'BANNED',
      time
    });
  }

  unmuteUser(userId: string, chatroomId: string) {
    this.socketService.send(events.CHATROOM_UNRESTRICT_USER, {
      userId,
      chatroomId,
      restrictionType: 'MUTED'
    });
  }

  unbanUser(userId: string, chatroomId: string) {
    this.socketService.send(events.CHATROOM_UNRESTRICT_USER, {
      userId,
      chatroomId,
      restrictionType: 'BANNED'
    });
  }

  kickUser(userId: string, chatroomId: string) {
    this.socketService.send(events.CHATROOM_KICK, { userId, chatroomId });
  }

  createOneToOne(firstUserId: string, secondUserId: string) {
    this.socketService.send(events.CHATROOM_CREATE, {
      roomType: 'ONE_TO_ONE',
      userIds: [firstUserId, secondUserId]
    });
  }

  inviteUser(chatroomId: string, userId: string) {
    this.socketService.send(events.CHATROOM_INVITE_USER, {
      chatroomId,
      userId
    });
  }

  async sendGameInvitation(gameUrl: string, destId: string) {
    this.socketService.send(events.GAME_INVITATION, { gameUrl, destId });
  }
}

export default new ChatService();
