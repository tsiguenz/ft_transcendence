import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', {
  persist: true,
  state() {
    return {
      userId: 0,
      nickname: '',
      loggedIn: false
    };
  },
  actions: {
    signin(id: number, nickname: string) {
      this.userId = id;
      this.loggedIn = true;
      this.nickname = nickname;
    },
    logout() {
      this.userId = 0;
      this.loggedIn = false;
      this.nickname = '';
    }
  }
});
