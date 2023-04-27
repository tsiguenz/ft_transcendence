<template></template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useConnectedUsersStore } from '@/store/connectedUsers';

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
      this.sessionStore.logout();
      this.connectedUsersStore.disconnect();
    }
  }
};
</script>
