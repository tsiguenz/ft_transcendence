<template>
  <v-sheet class="font" color="transparent">
    <h2>History Games</h2>
    <v-sheet color="transparent">
      <div v-if="isMounted" class="pr-5" v-for="index in games">
        <v-divider />
        <v-row class="justify-space-between" align="center">
          <v-sheet class="ma-4" color="transparent">
            <p>Score: {{ index.winnerScore }} - {{ index.loserScore }}</p>
            <p>Opponent: {{ getOpponent(index.winnerId, index.loserId) }}</p>
          </v-sheet>
					TEST {{ getPoints(index.winnerId, index.loserId, index) }}
          <v-sheet color="transparent">
            <p>{{ setDuration(index.createdAt) }}</p>
          </v-sheet>
        </v-row>
      </div>
    </v-sheet>
  </v-sheet>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import * as lib from '@/utils/lib';

export default {
  props: ['games', 'users', 'user'],
  data() {
    return {
      historyGames: [],
      isMounted: false
    };
  },
  async mounted() {
    await this.getGames();
  },
  methods: {
    getGames() {
      this.isMounted = true;
console.log("Games", this.games);
    },
    setDuration(dateToConvert) {
      return lib.convertDate(dateToConvert);
    },
    getOpponent(winnerIndex, loserIndex) {
      const winnerNickname = this.getUser(winnerIndex).nickname;
      const loserNickname = this.getUser(loserIndex).nickname;
      return this.user.nickname == winnerNickname
        ? loserNickname
        : winnerNickname;
    },
		getPoints(winnerIndex, loserIndex, currentGame) {
      const winner = this.getUser(winnerIndex);
      const loser = this.getUser(loserIndex);
			if (this.user.id == winner.id)
			return (currentGame.previousWinnerRating);
else
console.log("loser");
		},
		getUser(index) {
      return (this.users.filter(
        (users) => users.id == index
      )[0]);
		}
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
