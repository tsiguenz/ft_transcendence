<template>
  <v-app>
    <h1>Connected Users</h1>
    <ul>
      <li v-for="user in sessionStore.connectedUsers" :key="user">
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
import { useSessionStore } from '@/store/session';

export default {
  components: {
    AppHeader
  },
  data() {
    return {};
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  created() {
    this.jwt = this.$cookie.getCookie('jwt');
    if (!this.jwt || !this.sessionStore.loggedIn) return;
    this.sessionStore.connectStatusSocket(this.jwt);
  },
  mounted() {
    this.sessionStore.listenConnectedUsers();
  },
  beforeUnmount() {
    this.sessionStore.disconnectStatusSocket();
  },
  methods: {
    hideHeader() {
      return (
        this.$route.path === '/42/callback' ||
        this.$route.path === '/2fa/verify'
      );
    }
  }
};
</script>
