import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', {
  persist: true,
  state() {
    return {
      nickname: null,
      loggedIn: false
    };
  },
  actions: {
    signin(nickname) {
      this.loggedIn = true;
      this.nickname = nickname;
    },
    logout() {
      this.loggedIn = false;
      this.nickname = null;
    }
  }
});
