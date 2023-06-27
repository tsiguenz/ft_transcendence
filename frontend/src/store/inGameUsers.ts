import { defineStore } from 'pinia';

export const useInGameUsers = defineStore('inGameUsers', {
  persist: true,
  state() {
    return {
      inGameUsers: []
    };
  },
  actions: {
    setInGameUsers(users) {
      this.inGameUsers = users;
    },
    reset() {
      this.inGameUsers = [];
    },
    isInGame(id: string) {
      return this.inGameUsers.includes(id);
    }
  }
});
