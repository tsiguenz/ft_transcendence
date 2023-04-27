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
    connect(jwt) {
      console.log('socketConnected:', this.socketConnected);
      if (this.socketConnected) return;
      this.statusSocket = io(STATUS_SOCKET_URL, {
        auth: { token: jwt }
      });
      this.statusSocket.connect();
      this.socketConnected = true;
    },
    disconnect() {
      this.connectedUsers = [];
      if (!this.socketConnected) return;
      this.unsubscribeConnectedUsers();
      this.statusSocket.disconnect();
      this.statusSocket = null;
      this.socketConnected = false;
    },
    subscribeConnectedUsers() {
      if (!this.statusSocket) return;
      this.statusSocket.on('connectedUsers', (connectedUsers) => {
        this.connectedUsers = connectedUsers;
      });
    },
    connectAndSubscribe(jwt) {
      this.connect(jwt);
      this.subscribeConnectedUsers();
    },
    unsubscribeConnectedUsers() {
      if (!this.statusSocket) return;
      this.statusSocket.off('connectedUsers');
    }
  }
});
