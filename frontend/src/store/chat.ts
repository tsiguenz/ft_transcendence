import { defineStore } from 'pinia';
// import { useSessionStore } from '@/store/session';

export const useChatStore = defineStore('chat', {
  state() {
    return {
      messages: {},
      users: {},
      chatrooms: [],
      activeChatroom: undefined,
    };
  },
  getters: {
    currentChatroom(): any {
      if (this.activeChatroom === undefined) {
        return ;
      }
      return this.chatrooms.find((room) => room.id === this.activeChatroom);
    },

    activeRoomMessages() {
      if (this.messages.hasOwnProperty(this.activeChatroom)) {
        return this.messages[this.activeChatroom];
      }
      return [];
    },

  },
  actions: {
    addRoom(...rooms) {
      this.chatrooms.push(...rooms);
    },
    removeRoom(roomId) {
      this.chatrooms = this.chatrooms.filter((room) => (room.id !== roomId));
      delete this.messages[roomId];
    },
    // joinChatroom(chatroomId: number) {},
    storeMessage(message) {
      const chatroomId: number = message.chatroomId;

      if (!this.messages.hasOwnProperty(chatroomId)) {
        this.messages[chatroomId] = [];
      }
      this.messages[chatroomId].push(message);
    },

    storeUser(payload) {
      const chatroomId: number = payload.chatroomId;

      if (!this.users.hasOwnProperty(chatroomId)) {
        this.users[chatroomId] = [];
      }
      this.users[chatroomId].push(payload);
    },

    removeUser(payload) {
      const chatroomId: number = payload.chatroomId;
      if (this.users.hasOwnProperty(chatroomId)) {
        this.users[chatroomId] = this.users[chatroomId].filter(
          (user) => user.id !== payload.id
        );
      }
    },

    isUserOnline(userId: number, chatroomId: number) {
      if (this.users.hasOwnProperty(chatroomId)) {
        return this.users[chatroomId].find((user) => user.id === userId);
      }
      return false;
    },

    switchToDefaultChatroom() {
      if (this.chatrooms.length > 0) {
        this.activeChatroom = this.chatrooms[0].id;
      } else {
        this.activeChatroom = undefined;
      }
    }
  }
});