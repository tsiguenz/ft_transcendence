import { defineStore } from 'pinia';

export const useInGameUsersStore = defineStore('inGameUsers', {
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
    isInGame(id) {
      return this.inGameUsers.includes(id);
    }
  }
});
