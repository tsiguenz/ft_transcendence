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

  setup(jwt: string, callback: Function) {
    console.log("SOCKET IO SETUP");
    this.socketService.setupSocketConnection(jwt);
    console.log(this.socketService.socket);
    this.socketService.subscribe(events.EXCEPTION, callback);
    this.socketService.subscribe(events.CHATROOM_NEW, (payload: any) => {
      this.chatStore.addRoom(payload.chatroom);
      this.chatStore.joinRoom(payload.chatroom.id);
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
    // this.socketService.subscribe(events.EXCEPTION, callback);
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
    this.socketService.subscribe(events.CHATROOM_KICKED, callback);
  }

  createRoom(payload: { name: string; type: string; password: string }) {
    this.socketService.send(events.CHATROOM_CREATE, payload);
  }

  // getRooms() {
  //   this.socketService.send(events.CHATROOM_JOINABLE_ROOMS);
  // }

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
      name: 'SuperDuperChat',
      roomType: 'ONE_TO_ONE',
      userIds: [firstUserId, secondUserId]
    });
  }

  inviteUser(chatroomId: string, userId: string) {
    this.socketService.send(events.CHATROOM_INVITE_USER, {
      chatroomId,
      userId: '3db1f0c4-8209-4de6-acc6-b34419b3eff0'
    });
  }
}

export default new ChatService();
