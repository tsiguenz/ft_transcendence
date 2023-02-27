<template>
  <v-app>
    <AppHeader></AppHeader>
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
  }
};
</script>
