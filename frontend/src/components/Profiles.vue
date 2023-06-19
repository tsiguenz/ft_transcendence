<template>
  <v-container flex>
    <v-row justify="space-between">
      <v-col cols="3">
        <div class="position">
          <v-row justify="center">
            <ProfilePrintAvatar
              v-if="userIsMounted"
              :wdt="100"
              :hgt="100"
              :urlAvatar="user.avatarPath"
            />
          </v-row>
          <v-row justify="center">
            <h2 class="profileFont ma-3">{{ user.nickname }}</h2>
            <div v-if="nickname !== sessionStore.nickname" class="ma-5">
              <IsFriend
                :friendname="nickname"
                :is-friend-at-begining="isFriend(user.nickname)"
              ></IsFriend>
            </div>
          </v-row>
          <v-sheet class="profileFont sheet mt-5 pa-3">
            <h3 class="my-2 justify-center">{{ user.ladderPoints }}</h3>
            <p class="my-2">ladder points</p>
          </v-sheet>
          <v-sheet
            v-if="nickname !== sessionStore.nickname"
            class="sheet mt-5 pa-3"
          >
            <p>
              <ProfileLastConnection
                v-if="userIsMounted && nickname !== sessionStore.nickname"
                :user="user"
              />
            </p>
          </v-sheet>
          <v-btn
            v-if="nickname === sessionStore.nickname"
            class="mt-5 pa-3 log"
            to="/settings"
            >Settings</v-btn
          >
        </div>
      </v-col>
      <v-col cols="6">
        <ProfileHistoryGames
          v-if="userIsMounted"
          :games="gameStats"
          :users="users"
          :user="user"
        />
      </v-col>
      <v-col cols="3">
        <v-sheet class="position sheet pa-3">
          <ProfileGameStats
            v-if="userIsMounted"
            :user="user"
            :games="gameStats"
          />
        </v-sheet>
      </v-col>
    </v-row>
    <v-sheet height="10vh" class="blur"> </v-sheet>
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
import ProfileGameStats from './ProfileGameStats.vue';
import ProfileHistoryGames from './ProfileHistoryGames.vue';
import ProfileLastConnection from './ProfileLastConnection.vue';
import IsFriend from '../components/IsFriend.vue';

export default {
  props: ['nickname'],
  components: {
    ProfilePrintAvatar,
    ProfileLadderPoints,
    ProfileGameStats,
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
      friends: []
    };
  },
  watch: {
    nickname: {
      handler() {
        this.nickname != this.user.nickname;
        this.getProfile();
        this.getFriends();
      }
    }
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getProfile();
    await this.getFriends();
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
.sheet {
  background-color: var(--dark-purple);
  border-style: solid;
  border-radius: 2px;
  box-shadow: 5px 5px 5px var(--light-purple) !important;
  border-color: var(--light-purple) !important;
}
.blur {
  -webkit-mask: linear-gradient(#0000, rgba(0, 0, 0, 1));
  backdrop-filter: blur(4px);
  background-color: transparent;
  position: sticky;
  bottom: 0;
}
.position {
  position: sticky;
  top: 10vh;
}
.profileFont {
  font-family: 'Poppins', serif;
  text-align: center;
}
</style>
