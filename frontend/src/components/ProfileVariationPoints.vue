<template>
  {{ winLose }}
  <div v-if="differenceOfPoints != 0">
    [{{ getPreviousRating(game.winnerId, game.loserId, game) }}
    <v-icon
      v-if="differenceOfPoints > 0"
      icon="mdi-trending-up"
      color="green"
    ></v-icon>
    <v-icon
      v-else-if="differenceOfPoints < 0"
      icon="mdi-trending-down"
      color="red"
    ></v-icon>
    {{ getNewRating(game.winnerId, game.loserId, game) }}]
  </div>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import * as lib from '@/utils/lib';

export default {
  props: ['game', 'users', 'user'],
  data() {
    return {
      winner: [],
      loser: [],
      differenceOfPoints: 0,
      currentUser: [],
      winLose: ''
    };
  },
  watch: {
    user: {
      handler() {
        this.currentUser != this.user;
        this.getOpponents();
      }
    }
  },
  mounted() {
    this.getOpponents();
  },
  methods: {
    getOpponents() {
      this.currentUser = this.user;
      this.winner = this.getUser(this.game.winnerId);
      this.loser = this.getUser(this.game.loserId);
      this.differenceOfPoints =
        this.getNewRating(this.game.winnerId, this.game.loserId, this.game) -
        this.getPreviousRating(
          this.game.winnerId,
          this.game.loserId,
          this.game
        );
      if (this.user.id == this.winner.id)
        this.winLose =
          this.differenceOfPoints != 0
            ? 'Won ' + this.differenceOfPoints + ' points'
            : "Ranked game won (points don't change)";
      else
        this.winLose =
          this.differenceOfPoints != 0
            ? 'Lost ' + this.differenceOfPoints * -1 + ' points'
            : "Ranked game lost (points don't change)";
    },
    getPreviousRating(winnerIndex, loserIndex, currentGame) {
      if (this.user.id == this.winner.id)
        return currentGame.previousWinnerRating;
      else return currentGame.previousLoserRating;
    },
    getNewRating(winnerIndex, loserIndex, currentGame) {
      if (this.user.id == this.winner.id) return currentGame.newWinnerRating;
      else return currentGame.newLoserRating;
    },
    getUser(game) {
      return this.users.filter((users) => users.id == game)[0];
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
