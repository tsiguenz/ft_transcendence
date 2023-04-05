<template>
  <v-card>
    <v-tabs bg-color="dark" center-active>
      <v-tab to="/home">Home</v-tab>
      <v-tab v-if="isLog()" to="/game">Game</v-tab>
      <v-tab v-if="isLog()" to="/chat">Chat</v-tab>
      <v-tab v-if="isLog()" to="/leaderboard">Leaderboard</v-tab>
      <v-tab v-if="isLog()" to="/profile">Profile</v-tab>
      <v-tab v-if="!isLog()" to="/signin">Signin</v-tab>
      <v-tab v-if="!isLog()" to="/signup">Signup</v-tab>
    </v-tabs>
  </v-card>
</template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  methods: {
    isLog() {
      return this.sessionStore.loggedIn;
    }
  }
};
</script>
