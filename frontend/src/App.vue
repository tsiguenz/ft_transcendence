<template>
  <v-app>
    <h1>Connected Users</h1>
    <ul>
      <li v-for="user in connectedUsersStore.connectedUsers" :key="user">
        {{ user }}
      </li>
    </ul>
    <AppHeader v-if="!hideHeader()"></AppHeader>
    <router-view />
  </v-app>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import { mapStores } from 'pinia';
import { useConnectedUsersStore } from '@/store/connectedUsers';
import { useSessionStore } from '@/store/session';
import SocketioService from '@/services/socketio.service';
import { STATUS_SOCKET_URL } from './constants';

export default {
  components: {
    AppHeader
  },
  provide() {
    return {
      connectedUsersStore: this.connectedUsersStore,
      sessionStore: this.sessionStore
    };
  },
  data() {
    return {
      socketioStatus: new SocketioService(STATUS_SOCKET_URL)
    };
  },
  computed: {
    ...mapStores(useConnectedUsersStore),
    ...mapStores(useSessionStore)
  },
  created() {
    if (!this.sessionStore.isLoggedIn) {
      this.connectedUsersStore.reset();
    }
    this.connectStatusSocket();
  },
  mounted() {
    this.subscribeStatusSocket();
  },
  beforeUnmount() {
    this.disconnectStatusSocket();
  },
  methods: {
    hideHeader() {
      return (
        this.$route.path === '/42/callback' ||
        this.$route.path === '/2fa/verify'
      );
    },
    connectStatusSocket() {
      this.socketioStatus.setupSocketConnection(this.$cookie.getCookie('jwt'));
    },
    subscribeStatusSocket() {
      this.socketioStatus.subscribe('connectedUsers', (connectedUsers) => {
        this.connectedUsersStore.setConnectedUsers(connectedUsers);
      });
    },
    unsubscribeStatusSocket() {
      this.socketioStatus.unsubscribe('connectedUsers');
    },
    disconnectStatusSocket() {
      this.socketioStatus.disconnect();
    },
    connectAndSubscribeStatusSocket() {
      this.connectStatusSocket();
      this.subscribeStatusSocket();
    },
    unsubscribeAndDisconnectStatusSocket() {
      this.unsubscribeStatusSocket();
      this.disconnectStatusSocket();
    }
  }
};
</script>
