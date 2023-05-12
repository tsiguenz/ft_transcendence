<template>
  <div class="font">
    <h2>History Games</h2>
    <v-container flex>
      <div v-for="(score, index) in historyGames.score">
        <v-divider />
        <v-row class="justify-space-between" align="center">
          <v-sheet class="ma-4" color="transparent">
            <p>Respt: {{ score }}</p>
            <p>Opponent {{ historyGames.opponent[index] }}</p>
          </v-sheet>
          <v-sheet color="transparent">
            <p>{{ historyGames.date[index] }}</p>
          </v-sheet>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import ProfilePrintAvatar from '../components/ProfilePrintAvatar.vue';

export default {
  data() {
    return {
      user: {},
      historyGames: [],
      test: []
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getProfile();
    await this.putHistoryGames();
  },
  methods: {
    async getProfile() {
      try {
        const response = await axios.get(constants.API_URL + `/users/${this.sessionStore.nickname}/profile`);
        this.user = response.data;
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
        this.$router.push('/logout');
      }
    },
    async putHistoryGames() {
      this.historyGames = {
        score: [
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1'
        ],
        opponent: [
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz'
        ],
        date: [
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023'
        ]
      };
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
