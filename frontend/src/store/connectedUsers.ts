import { defineStore } from 'pinia';

export const useConnectedUsersStore = defineStore('connectedUsers', {
  persist: true,
  state() {
    return {
      connectedUsers: []
    };
  },
  actions: {
    setConnectedUsers(users) {
      this.connectedUsers = users;
    },
    reset() {
      this.connectedUsers = [];
    },
    isConnected(id) {
      return this.connectedUsers.includes(id);
    }
  }
});
