<template>
  <v-container flex>
    <v-row align="center">
      <v-col cols="3">
        <v-sheet class="sheet pa-3">
          <div class="py-5">
            <ProfileLadderPoints v-if="userIsMounted" :user="user" />
          </div>
          <ProfileAchievements />
        </v-sheet>
      </v-col>
      <v-col cols="6">
        <v-sheet color="transparent">
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
          <ProfileHistoryGames />
        </v-sheet>
      </v-col>
      <v-col cols="3" align="center">
        <v-sheet class="sheet pa-3">
          <p class="ma-5">
            <ProfileLastConnection v-if="userIsMounted" :user="user" />
          </p>
          <v-row class="justify-center"><h2 class="font">12</h2></v-row>
          <v-row class="justify-center mb-5"
            ><p class="font">Game won</p></v-row
          >
          <v-row class="justify-center"><h2 class="font">23</h2></v-row>
          <v-row class="justify-center mb-5"
            ><p class="font">Game played</p></v-row
          >
        </v-sheet>
        <v-btn class="ma-5 log" to="/settings"
          >Settings</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
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
      userIsMounted: false
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
console.log("HERE");
      try {
        const response = await axios.get(constants.API_URL + `/users/${this.nickname}`);

        this.user = response.data;
        this.user.avatarPath = constants.AVATARS_URL + this.user.avatarPath;
        this.userIsMounted = true;
        this.currentUser = this.user.nickname;
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
        this.$router.push('/logout');
      }
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
.sheet {
  background: var(--dark-purple);
  border-radius: 30px;
  border: 3px solid var(--light);
}
</style>
