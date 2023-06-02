<template>
  <v-container flex>
    <v-row class="align-center">
      <v-col>
        <v-sheet class="mt-5" color="transparent">
          <v-row justify="center">
            <ProfilePrintAvatar
              v-if="userIsMounted"
              :wdt="100"
              :hgt="100"
              :urlAvatar="user.avatarPath"
            />
          </v-row>
          <v-row class="justify-center">
            <h2 class="font ma-3">{{ user.nickname }}</h2>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row class="align-top">
      <v-col cols="3">
        <v-sheet class="position sheet pa-3">
          <div class="py-5">
            <ProfileLadderPoints v-if="userIsMounted" :user="user" />
          </div>
          <ProfileAchievements v-if="userIsMounted" />
        </v-sheet>
      </v-col>
      <v-col cols="6">
        <v-sheet color="transparent">
          <ProfileHistoryGames
            v-if="userIsMounted"
            :gamesWin="gameStats.gamesWin"
            :gamesLose="gameStats.gamesLose"
            :users="users"
          />
        </v-sheet>
      </v-col>
      <v-col cols="3" align="center">
        <div class="position">
          <v-sheet class="sheet pa-3">
            <p class="ma-10">
              <ProfileLastConnection
                v-if="userIsMounted && nickname !== sessionStore.nickname"
                :user="user"
              />
            </p>
            <v-row class="justify-center"
              ><h2 class="font">{{ gamesWin }}</h2></v-row
            >
            <v-row class="justify-center mb-5"
              ><p class="font">Game won</p></v-row
            >
            <v-row class="justify-center"
              ><h2 class="font">{{ gamesPlayed }}</h2></v-row
            >
            <v-row class="justify-center mb-5"
              ><p class="font">Game played</p></v-row
            >
          </v-sheet>
          <v-btn
            v-if="nickname === sessionStore.nickname"
            class="ma-5 log"
            to="/settings"
            >Settings</v-btn
          >
        </div>
      </v-col>
    </v-row>
  </v-container>
  <v-sheet v-if="isPageLongerThanWindow" height="10vh" class="blur"> </v-sheet>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import * as lib from '@/utils/lib';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import ProfilePrintAvatar from './ProfilePrintAvatar.vue';
import ProfileLadderPoints from './ProfileLadderPoints.vue';
import ProfileAchievements from './ProfileAchievements.vue';
import ProfileHistoryGames from './ProfileHistoryGames.vue';
import ProfileLastConnection from './ProfileLastConnection.vue';

export default {
  props: ['nickname'],
  components: {
    ProfilePrintAvatar,
    ProfileLadderPoints,
    ProfileAchievements,
    ProfileHistoryGames,
    ProfileLastConnection
  },
  data() {
    return {
      user: {},
      users: [],
      userIsMounted: false,
      gameStats: {},
      gamesWin: 0,
      gamesPlayed: 0,
      isPageLongerThanWindow: false
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getProfile();
    this.checkIfPageIsLongerThanWindow();
    window.addEventListener('resize', this.checkIfPageIsLongerThanWindow);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkIfPageIsLongerThanWindow);
  },
  methods: {
    async getProfile() {
      try {
        const responseUser = await axios.get(
          constants.API_URL + `/users/${this.nickname}`
        );
        const responseGame = await axios.get(
          constants.API_URL + `/users/${this.nickname}/games`
        );

        const jwt = this.$cookie.getCookie('jwt');
        const responseUsers = await axios.get(constants.API_URL + '/users', {
          headers: {
            Authorization: 'Bearer ' + jwt
          }
        });
        this.users = responseUsers.data;
        this.user = responseUser.data;
        this.user.avatarPath = constants.AVATARS_URL + this.user.avatarPath;
        this.gameStats = responseGame.data;
        this.gamesWin = this.gameStats.gamesWin.length;
        this.gamesPlayed = this.gamesWin + this.gameStats.gamesLose.length;
        this.userIsMounted = true;
      } catch (error) {
        swal({
          icon: 'error',
          text: lib.formatError(error.response.data.message)
        });
        this.$router.push('/logout');
      }
    },
    checkIfPageIsLongerThanWindow() {
      const pageHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      this.isPageLongerThanWindow = pageHeight > windowHeight;
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
.sheet {
  background-color: var(--dark-purple);
  border-style: solid;
  border-radius: 2px;
  box-shadow: 5px 5px 5px var(--light-purple) !important;
  border-color: var(--light-purple) !important;
}
.position {
  position: sticky;
  top: 1vh;
}
.blur {
  background: -webkit-linear-gradient(
    rgba(96, 15, 223, 0) 0%,
    rgba(96, 15, 223, 1) 100%
  );
  position: -webkit-sticky;
  position: sticky;
  bottom: 0;
}
</style>
