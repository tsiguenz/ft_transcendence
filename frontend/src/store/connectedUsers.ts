import { defineStore } from 'pinia';
import { STATUS_SOCKET_URL } from '../constants';
import io from 'socket.io-client';

export const useConnectedUsersStore = defineStore('connectedUsers', {
  persist: true,
  state() {
    return {
      socketConnected: false,
      statusSocket: null,
      connectedUsers: []
    };
  },
  actions: {
    connectStatusSocket(jwt) {
      if (this.socketConnected) return;
      this.statusSocket = io(STATUS_SOCKET_URL, {
        auth: { token: jwt }
      });
      this.statusSocket.connect();
      this.socketConnected = true;
    },
    disconnectStatusSocket() {
      this.connectedUsers = [];
      if (!this.socketConnected) return;
      this.statusSocket.disconnect();
      this.statusSocket = null;
      this.socketConnected = false;
    },
    listenConnectedUsers() {
      if (!this.statusSocket) return;
      this.statusSocket.on('connectedUsers', (connectedUsers) => {
        this.connectedUsers = connectedUsers;
      });
    }
  }
});
