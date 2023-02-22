<template>
  <v-card>
    <v-tabs bg-color="white" center-active>
      <v-tab to="/">Home</v-tab>
      <v-tab to="/leaderboard">Leaderboard</v-tab>
      <v-tab to="/game">Game</v-tab>
      <v-tab to="/account">Account</v-tab>
      <v-tab to="/about">About</v-tab>
    </v-tabs>
  </v-card>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {};
  }
};
</script>
