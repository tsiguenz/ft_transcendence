import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', {
  persist: true,
  state() {
    return {
      userId: undefined,
      nickname: '',
      loggedIn: false,
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
  }
});
