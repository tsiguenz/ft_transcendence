<template></template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  data() {
    return {};
  },
  mounted() {
    this.logout();
    this.$router.push('/home');
  },
  computed: {
    ...mapStores(useSessionStore),
  },
  methods: {
    logout() {
      if (this.$cookie.isCookieAvailable('jwt')) {
        this.$cookie.removeCookie('jwt');
        this.sessionStore.logout();
      }
    }
  }
};
</script>
