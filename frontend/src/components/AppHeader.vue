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
      <v-tab v-if="isLog()" to="/logout">Logout</v-tab>
    </v-tabs>
  </v-card>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    // TODO: verify the jwt
    isLog() {
      return this.$cookie.isCookieAvailable('jwt');
    }
  }
};
</script>
