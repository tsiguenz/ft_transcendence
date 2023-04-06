import { defineStore } from 'pinia';
// import { useSessionStore } from '@/store/session';

export const useChatStore = defineStore('chat', {
  state() {
    return {
      messages: {}
      // chatrooms: [],
      // activeChatroom: undefined
    };
  },
  getters: {
    // currentChatroom(): any {
    //   if (this.activeChatroom === undefined) {
    //     return;
    //   }
    //   return this.chatrooms.find((room) => room.id === this.activeChatroom);
    // }
  },
  actions: {
    // joinChatroom(chatroomId: number) {},
    storeMessage(message) {
      const chatroomId: number = message.chatroomId;

      if (!this.messages.hasOwnProperty(chatroomId)) {
        this.messages[chatroomId] = [];
      }
      this.messages[chatroomId].push(message);
    }
  }
});
