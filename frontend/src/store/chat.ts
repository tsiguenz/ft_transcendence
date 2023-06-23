import { defineStore } from 'pinia';
import { useSessionStore } from '@/store/session';

const sessionStore = useSessionStore();
export const useChatStore = defineStore('chat', {
  state() {
    return {
      messages: {},
      users: [],
      chatrooms: [],
      activeChatroom: undefined,
      blockedUsers: []
    };
  },
  getters: {
    currentChatroom(): any {
      if (this.activeChatroom === undefined) {
        return;
      }
      return this.chatrooms.find((room) => room.id === this.activeChatroom);
    },

    activeRoomMessages() {
      if (this.messages.hasOwnProperty(this.activeChatroom)) {
        return this.filteredMessages[this.activeChatroom];
      }
      return [];
    },

    activeRoomUsers() {
      if (this.users && this.users.hasOwnProperty(this.activeChatroom)) {
        return this.users[this.activeChatroom];
      }
      return [];
    },

    currentChatroomUser() {
      if (!this.users) {
        return;
      }
      return this.users.find((x) => x.id === sessionStore.userId);
    },

    filteredMessages() {
      let filteredMessages = {};

      for (var chatroomId in this.messages) {
        filteredMessages[chatroomId] = this.messages[chatroomId].filter(
          (x) => !this.isUserBlocked(x.authorId)
        );
      }

      return filteredMessages;
    }
  },
  actions: {
    addRoom(...rooms) {
      for (const room of rooms) {
        if (!this.chatrooms.some((e) => e.id === room.id)) {
          this.chatrooms.push(this.renameRoom(room));
        }
      }
    },
    renameRoom(room) {
      if (room.type !== 'ONE_TO_ONE') {
        return room;
      }
      const otherUser = room.users.find(
        (e) => e.user.nickname !== sessionStore.nickname
      );

      if (otherUser) {
        room.name = `PM [${otherUser.user.nickname}]`;
      }
      return room;
    },
    removeRoom(roomId) {
      this.chatrooms = this.chatrooms.filter((room) => room.id !== roomId);
      delete this.messages[roomId];
    },
    joinRoom(chatroomId) {
      this.activeChatroom = chatroomId;
    },
    storeMessage(message) {
      const chatroomId: string = message.chatroomId;

      if (!this.messages.hasOwnProperty(chatroomId)) {
        this.messages[chatroomId] = [];
      }
      this.messages[chatroomId].push(message);
    },
    addUserToRoom(chatroomId: string, user: string) {
      if (this.activeChatroom === chatroomId) {
        this.users.push(user);
      }
    },
    removeUserFromRoom(chatroomId: string, userId: string) {
      if (this.activeChatroom === chatroomId) {
        this.users = this.users.filter((user) => user.id !== userId);
      }
    },

    setUserRole(userId, chatroomId, role) {
      const i = this.users.findIndex((e) => e.id == userId);
      this.users[i].role = role;
    },

    setUserRestriction(userId, type, duration) {
      const date = new Date();
      const until = new Date(date.getTime() + duration * 1000 * 60);
      const i = this.users.findIndex((e) => e.id == userId);
      const restriction = { type: type, restrictedUntil: until };

      this.users[i].restrictions.push(restriction);
    },

    removeUserRestriction(userId, type) {
      const i = this.users.findIndex((e) => e.id == userId);
      this.users[i].restrictions = this.users[i].restrictions.filter(
        (restriction) => restriction.type !== type
      );
    },

    getUserRestrictions(userId) {
      const i = this.users.findIndex((e) => e.id == userId);
      return this.users[i].restrictions.filter(
        (restriction) => new Date(restriction.restrictedUntil) >= new Date()
      );
    },

    isUserOnline(userId: string, chatroomId: string) {
      if (this.users && this.users.hasOwnProperty(chatroomId)) {
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
    },

    addBlockedUser(...users) {
      this.blockedUsers.push(...users);
    },

    removeBlockedUser(toRemove: string) {
      this.blockedUsers = this.blockedUsers.filter((user) => user !== toRemove);
    },

    isUserBlocked(userId) {
      return this.blockedUsers.includes(userId);
    }
  }
});
