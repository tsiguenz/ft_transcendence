<template>
<p>{{ ladderPoints }} ladder points</p>
<p>{{ gamesPlayed }} games played</p>
<p>{{ gamesWon }} games won</p>
<p>{{ gamesLost }} games lost</p>
<p>{{ gamesRanked }} ranked games played</p>
<p>{{ gamesCustom}} custom games played</p>
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
			ladderPoints: 0,
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
			this.ladderPoints = this.user.ladderPoints;
			this.gamesWon = this.games.gamesWin.length;
			this.gamesLost = this.games.gamesLose.length;
			this.gamesPlayed = this.gamesWon + this.gamesLost;
			this.gamesRanked = this.games.gamesWin.filter((games) => games.isRanked == true).length;
			this.gamesRanked += this.games.gamesLose.filter((games) => games.isRanked == true).length;
			this.gamesCustom= this.games.gamesWin.filter((games) => games.isRanked == false).length;
			this.gamesCustom += this.games.gamesLose.filter((games) => games.isRanked == false).length;
			console.log("Custom", this.gamesCustom);
			console.log("USER", this.user);
			console.log("GAMES", this.games);
		}
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
