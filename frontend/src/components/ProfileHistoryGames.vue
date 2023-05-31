<template>
  <div class="font">
    <h2>History Games</h2>
    <v-container flex>
<!--      <div v-for="(score, index) in historyGames.score"> -->
      <div v-for="index in games">
        <v-divider />
        <v-row class="justify-space-between" align="center">
          <v-sheet class="ma-4" color="transparent">
            <p>Respt: {{ index.winnerScore }} - {{ index.loserScore }} </p>
            <p>Opponent {{ index.winnerId }} - {{ index.loserId }}</p>
          </v-sheet>
          <v-sheet color="transparent">
            <p></p>
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

export default {
props: ["gamesWin", "gamesLose"],
  data() {
    return {
      historyGames: [],
      games: [],
			users: []
    };
  },
  async mounted() {
    await this.putHistoryGames();
		this.getGames();
		await this.getUsers();
  },
  methods: {	
	getGames() {
		this.games.push(...this.gamesWin);
		this.games.push(...this.gamesLose);
	},
    async getUsers() {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.get(constants.API_URL + '/users', {
          headers: {
            Authorization: 'Bearer ' + jwt
          }
        });
        this.users = response.data;
      } catch (error) {
        swal({
          title: 'Error',
          text: formatError(error.response.data.message),
          icon: 'error',
          button: 'OK'
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
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
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
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
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
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
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
