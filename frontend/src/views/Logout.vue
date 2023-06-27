<template></template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useConnectedUsersStore } from '@/store/connectedUsers';
import * as lib from '@/utils/lib';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapStores(useSessionStore),
    ...mapStores(useConnectedUsersStore)
  },
  mounted() {
    this.logout();
    this.$router.push('/home');
  },
  methods: {
    logout() {
      if (this.$cookie.isCookieAvailable('jwt'))
        this.$cookie.removeCookie('jwt');
      if (this.$cookie.isCookieAvailable('refresh_token'))
        this.$cookie.removeCookie('refresh_token');
      this.$root.unsubscribeAndDisconnectStatusSocket();
      this.sessionStore.logout();
      lib.resetStores();
    }
  }
};
</script>
