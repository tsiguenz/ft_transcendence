<template>
  <v-app>
    <AppHeader v-if="!hideHeader()"></AppHeader>
    <router-view />
  </v-app>
</template>

<script>
import AppHeader from './components/AppHeader.vue';

export default {
  components: {
    AppHeader
  },
  data() {
    return {};
  },
  methods: {
    hideHeader() {
      return (
        this.$route.path === '/callback' || this.$route.path === '/2fa/verify'
      );
    }
  }
};
</script>
