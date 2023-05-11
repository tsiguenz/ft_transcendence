import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', {
  persist: true,
  state() {
    return {
      userId: undefined,
      nickname: '',
      loggedIn: false,
      blockedUsers: []
    };
  },
  actions: {
    signin(id: string, nickname: string) {
      this.userId = id;
      this.loggedIn = true;
      this.nickname = nickname;
    },
    logout() {
      this.userId = undefined;
      this.loggedIn = false;
      this.nickname = '';
      this.blockedUsers = [];
    },
    addBlockedUser(...users) {
      this.blockedUsers.push(...users);
    },
    removeBlockedUser(toRemove: string) {
      this.blockedUsers = this.blockedUsers.filter((user) => (user !== toRemove));
    },
    isUserBlocked(userId) {
      return this.blockedUsers.includes(userId);
    }
  }
});
