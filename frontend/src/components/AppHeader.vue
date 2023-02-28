<template>
  <v-card>
    <v-tabs bg-color="dark" center-active>
      <v-tab to="/home">Home</v-tab>
      <v-tab to="/game">Game</v-tab>
      <v-tab to="/leaderboard">Leaderboard</v-tab>
      <v-tab to="/profile">Profile</v-tab>
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
    isLog() {
      return this.$cookie.isCookieAvailable('jwt');
    }
  }
};
</script>
