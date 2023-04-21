<!-- <template>
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
</template> -->

<template>
  <nav>
    <!-- <v-toolbar flat app>
      <v-toolbar-side-icon @click="drawer = !drawer" class="grey--text"></v-toolbar-side-icon>
      <v-toolbar-title class="text-uppercase grey--text">
        <span class="font-weight-light">Todo</span>
        <span>Ninja</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
     
    </v-toolbar> -->

    <v-navigation-drawer v-model="drawer" app class="navBar">
      <v-list>
        <v-list-item to="/home" style="margin-block: 5%;">
          <v-avatar rounded="0" size="25px" style="display:inline-block;margin-right: 5%;">
            <v-img src="./icons/house.png" style="display:inline-block;"></v-img></v-avatar>Home</v-list-item>
        <v-list-item v-if="isLog()" to="/game" style="margin-block: 5%;">
          <v-avatar rounded="0" size="25px" style="display:inline-block;margin-right: 5%;">
            <v-img src="./icons/joystick.png" style="display:inline-block;margin-right: 5%;"></v-img></v-avatar>Game</v-list-item>
        <v-list-item v-if="isLog()" to="/chat" style="margin-block: 5%;">
          <v-avatar rounded="0" size="25px" style="display:inline-block;margin-right: 5%;">
            <v-img src="./icons/chat.png" style="display:inline-block;margin-right: 5%;"></v-img></v-avatar>Social</v-list-item>
        <v-list-item v-if="isLog()" to="/leaderboard" style="margin-block: 5%;">
          <v-avatar rounded="0" size="25px" style="display:inline-block;margin-right: 5%;">
            <v-img src="./icons/trophy.png" style="display:inline-block;margin-right: 5%;"></v-img></v-avatar>Leaderboard</v-list-item>
        <v-list-item v-if="!isLog()" to="/signin">Signin</v-list-item>
        <v-list-item v-if="!isLog()" to="/signup">Signup</v-list-item>
      </v-list>
      <template #append>
          <div class="pa-2">
            <v-list-item v-if="isLog()" to="/profile" style="margin-block: 5%;"> <v-avatar rounded="0" size="25px" style="display:inline-block;margin-right: 5%;"><v-img src="./icons/user.png" style="display:inline-block;margin-right: 5%;"></v-img></v-avatar>Profile</v-list-item>
            <v-btn v-if="isLog()" class="button"  block to="/logout">Logout</v-btn>
            <v-btn v-if="!isLog()" class="button"  block to="/signin">Sign In</v-btn>
          </div>
        </template>
    </v-navigation-drawer>

  </nav>
</template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  data() {
    return {
      drawer: true
    };
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

<style scoped>

>>>.navBar{
  background: #0F0124;
}
>>>.button:hover {
  background-position: right center;
}

>>>.button {
  background-image: linear-gradient(to right, #600FDF 0%, #2B0366 51%, #600FDF 100%);
  flex: 1 1 auto;
  padding: 30px;
  text-align: center;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  border-radius: 10px;
}
</style>