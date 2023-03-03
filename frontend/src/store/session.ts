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
    signup({ nickname }) {
      this.loggedIn = true;
      this.nickname = nickname;
    }
  }
});
