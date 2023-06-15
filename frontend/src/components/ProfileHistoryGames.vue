<template>
  <v-sheet class="ma-5 font" color="transparent">
    <h2>History Games</h2>
    <v-sheet color="transparent">
      <div v-for="index in games">
        <v-divider />
        <v-sheet class="my-3 py-5" color="transparent">
          <v-row class="justify-space-between">
            <div>
              <p>Score: {{ index.winnerScore }} - {{ index.loserScore }}</p>
              <p>Opponent: {{ getOpponent(index.winnerId, index.loserId) }}</p>
            </div>
            <div>
              <p>
                Ladder points:
                {{ getPreviousRating(index.winnerId, index.loserId, index) }}
                <v-icon
                  v-if="
                    getPreviousRating(index.winnerId, index.loserId, index) <
                    getNewRating(index.winnerId, index.loserId, index)
                  "
                  icon="mdi-trending-up"
                  color="green"
                ></v-icon>
                <v-icon v-else icon="mdi-trending-down" color="red"></v-icon>
                {{ getNewRating(index.winnerId, index.loserId, index) }}
              </p>
              <p>Date: {{ setDuration(index.createdAt) }}</p>
            </div>
          </v-row>
        </v-sheet>
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
    return {};
  },
  methods: {
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
    getPreviousRating(winnerIndex, loserIndex, currentGame) {
      const winner = this.getUser(winnerIndex);
      const loser = this.getUser(loserIndex);
      if (this.user.id == winner.id) return currentGame.previousWinnerRating;
      else return currentGame.previousLoserRating;
    },
    getNewRating(winnerIndex, loserIndex, currentGame) {
      const winner = this.getUser(winnerIndex);
      const loser = this.getUser(loserIndex);
      if (this.user.id == winner.id) return currentGame.newWinnerRating;
      else return currentGame.newLoserRating;
    },
    getUser(index) {
      return this.users.filter((users) => users.id == index)[0];
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
