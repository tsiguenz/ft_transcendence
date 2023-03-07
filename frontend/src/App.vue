<template>
  <v-app>
    <AppHeader></AppHeader>
    <router-view />
  </v-app>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import SocketioService from './services/socketio.service';

export default {
  components: {
    AppHeader
  },
  created() {
    SocketioService.setupSocketConnection();
  },
  beforeUnmount() {
    SocketioService.disconnect();
  },
  data() {
    return {};
  }
};
</script>
