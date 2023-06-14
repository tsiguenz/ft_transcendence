<template>
  <div class="profileGameText">
    <h3>Game stats</h3>
    <v-divider />
    <h2 class="my-2">{{ gamesPlayed }}</h2>
    <p class="my-2">games played</p>
    <v-divider />
    <h2 class="my-2">{{ gamesWon }}</h2>
    <p class="my-2">games won</p>
    <v-divider />
    <h2 class="my-2">{{ gamesLost }}</h2>
    <p class="my-2">games lost</p>
    <v-divider />
    <h2 class="my-2">{{ gamesRanked }}</h2>
    <p class="my-2">ranked games played</p>
    <v-divider />
    <h2 class="my-2">{{ gamesCustom }}</h2>
    <p class="my-2">custom games played</p>
    <v-divider />
    <h2 class="my-2">{{ totalScore }}</h2>
    <p class="my-2">points scored</p>
  </div>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  props: ['user', 'games'],
  data() {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesRanked: 0,
      gamesCustom: 0,
      totalScore: 0
    };
  },
  async mounted() {
    this.getDatas();
  },
  methods: {
    getDatas() {
      this.gamesPlayed = this.games.length;
      const gamesWin = this.games.filter(
        (games) => games.winnerId == this.user.id
      );
      const gamesLose = this.games.filter(
        (games) => games.loserId == this.user.id
      );
      this.gamesWon = gamesWin.length;
      this.gamesLost = gamesLose.length;
      this.gamesRanked = this.games.filter(
        (games) => games.isRanked == true
      ).length;
      this.gamesCustom = this.games.filter(
        (games) => games.isRanked == false
      ).length;

      for (let i = 0; i < gamesWin.length; ++i) {
        this.totalScore += gamesWin[i].winnerScore;
      }

      for (let i = 0; i < gamesLose.length; ++i) {
        this.totalScore += gamesLose[i].loserScore;
      }
    }
  }
};
</script>

<style>
.profileGameText {
  font-family: 'Poppins', serif;
  text-align: center;
}
</style>
