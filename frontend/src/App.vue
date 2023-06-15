<template>
  <v-app>
    <div class="app">
      <AppHeader></AppHeader>
      <div class="content-wrapper">
        <Navbar />
        <router-view />
      </div>
    </div>
  </v-app>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import Navbar from './components/NavBar.vue';
import { mapStores } from 'pinia';
import { useConnectedUsersStore } from '@/store/connectedUsers';
import { useFriendStore } from '@/store/friend';
import { useSessionStore } from '@/store/session';
import SocketioService from '@/services/socketio.service';
import { STATUS_SOCKET_URL } from './constants';

export default {
  components: {
    AppHeader,
    Navbar
  },
  provide() {
    return {
      connectedUsersStore: this.connectedUsersStore,
      sessionStore: this.sessionStore,
      friendStore: this.friendStore
    };
  },
  data() {
    return {
      socketioStatus: new SocketioService(STATUS_SOCKET_URL)
    };
  },
  computed: {
    ...mapStores(useConnectedUsersStore),
    ...mapStores(useSessionStore),
    ...mapStores(useFriendStore)
  },
  created() {
    if (this.sessionStore.loggedIn) this.connectStatusSocket();
  },
  mounted() {
    if (this.sessionStore.loggedIn) this.subscribeStatusSocket();
  },
  beforeUnmount() {
    this.disconnectStatusSocket();
  },
  methods: {
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

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

button {
  cursor: pointer;
  appearance: none;
  border: none;
  outline: none;
  background: none;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.app {
  background: linear-gradient(var(--medium-purple), var(--light));
  display: flex;
  width: 100%;
  main {
    flex: 1 1 0;
    padding: 2rem;
  }
}
</style>
