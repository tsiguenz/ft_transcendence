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

export default {
  components: {
    AppHeader
  },
  data() {
    return {};
  },
  computed: {
    ...mapStores(useConnectedUsersStore)
  },
  created() {},
  mounted() {
    //    this.connectedUsersStore.connectStatusSocket(this.$cookie.getCookie('jwt'));
    //    this.connectedUsersStore.listenConnectedUsers();
  },
  beforeUnmount() {
    //    this.connectedUsersStore.disconnectStatusSocket();
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
