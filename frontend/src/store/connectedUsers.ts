import { defineStore } from 'pinia';

export const useConnectedUsersStore = defineStore('connectedUsers', {
  persist: true,
  state() {
    return {
      connectedUsers: [],
      inGameUsers: []
    };
  },
  actions: {
    setConnectedUsers(users) {
      this.connectedUsers = users;
    },
    setInGameUsers(users) {
      this.inGameUsers = users;
    },
    reset() {
      this.connectedUsers = [];
      this.inGameUsers = [];
    },
    isConnected(id: string) {
      return this.connectedUsers.includes(id);
    },
    isInGame(id: string) {
      return this.inGameUsers.includes(id);
    }
  }
});
