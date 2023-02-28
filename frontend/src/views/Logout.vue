<template></template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {
    this.logout();
    this.$router.push('/');
  },
  methods: {
    logout() {
      if (this.$cookie.isCookieAvailable('jwt')) {
        this.$cookie.removeCookie('jwt');
      }
    },
    isLog() {
      return this.$cookie.isCookieAvailable('jwt') ? true : false;
    }
  }
};
</script>
