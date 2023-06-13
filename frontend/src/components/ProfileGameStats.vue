<template>
<div class="font">
<p class="my-2">{{ ladderPoints }} ladder points</p>
        <v-divider />
<p class="my-2">{{ gamesPlayed }} games played</p>
        <v-divider />
<p class="my-2">{{ gamesWon }} games won</p>
        <v-divider />
<p class="my-2">{{ gamesLost }} games lost</p>
        <v-divider />
<p class="my-2">{{ gamesRanked }} ranked games played</p>
        <v-divider />
<p class="my-2">{{ gamesCustom }} custom games played</p>
        <v-divider />
<p class="my-2">{{ totalScore }} points scored</p>
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
			this.gamesPlayed = this.games.length;
			const gamesWin = this.games.filter((games) => games.winnerId == this.user.id);
			const gamesLose= this.games.filter((games) => games.loserId == this.user.id);
			this.gamesWon = gamesWin.length;
			this.gamesLost = gamesLose.length;
			this.gamesRanked= this.games.filter((games) => games.isRanked == true).length;
			this.gamesCustom = this.games.filter((games) => games.isRanked == false).length;
			
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
.font {
  font-family: 'Poppins', serif;
}
</style>
