import { defineStore } from 'pinia';
import { STATUS_SOCKET_URL } from '../constants';
import io from 'socket.io-client';

export const useSessionStore = defineStore('session', {
  persist: true,
  state() {
    return {
      nickname: null,
      loggedIn: false,
      statusSocket: null,
      connectedUsers: []
    };
  },
  actions: {
    signin(nickname) {
      this.loggedIn = true;
      this.nickname = nickname;
      //this.connectStatusSocket();
    },
    logout() {
      this.loggedIn = false;
      this.nickname = null;
      this.disconnectStatusSocket();
    },
    connectStatusSocket(jwt) {
      if (this.statusSocket !== null) return;
      this.statusSocket = io(STATUS_SOCKET_URL, {
        auth: { token: jwt }
      });
      this.statusSocket.connect();
    },
    disconnectStatusSocket() {
      this.connectedUsers = [];
      if (!this.statusSocket) return;
      this.statusSocket.disconnect();
      this.statusSocket = null;
    },
    listenConnectedUsers() {
      if (!this.statusSocket) return;
      this.statusSocket.on('connectedUsers', (connectedUsers) => {
        this.connectedUsers = connectedUsers;
      });
    }
  }
});
