<template>
  <v-container flex>
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
    <v-row class="align-center">
      <v-col cols="3">
        <v-sheet class="sheet pa-3">
          <div class="py-5">
            <ProfileLadderPoints v-if="userIsMounted" :user="user" />
          </div>
          <ProfileAchievements v-if="userIsMounted" :user="user" :games="gameStats" />
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
				<div v-else class="ma-5">
          <IsFriend
            :friendname="nickname"
            :is-friend-at-begining="isFriend(user.nickname)"
          ></IsFriend>
				</div>
      </v-col>
    </v-row>
  </v-container>
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
import IsFriend from '../components/IsFriend.vue';

export default {
  props: ['nickname'],
  components: {
    ProfilePrintAvatar,
    ProfileLadderPoints,
    ProfileAchievements,
    ProfileHistoryGames,
    IsFriend,
    ProfileLastConnection
  },
  data() {
    return {
      user: {},
      users: [],
      userIsMounted: false,
      gameStats: {},
      gamesWin: 0,
      friends: [],
      gamesPlayed: 0
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getProfile();
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

        const responseUsers = await axios.get(constants.API_URL + '/users');
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
    async getFriends() {
      try {
        const response = await axios.get(
          constants.API_URL + `/users/${this.sessionStore.nickname}/friends`
        );
        this.friends = response.data.map((friend) => friend.nickname);
      } catch (error) {
        swall({
          title: 'Error',
          text: lib.formatError(error.response.data.message),
          icon: 'error',
          button: 'OK'
        });
        this.$router.push('/logout');
      }
    },
    isFriend(nickname) {
      return this.friends.includes(nickname);
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
</style>
