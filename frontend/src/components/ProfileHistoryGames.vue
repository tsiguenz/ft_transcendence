<template>
  <v-container flex class="font">
    <v-sheet color="transparent">
      <h2 class="mb-5">History Games</h2>
      <v-sheet class="overflow-y-auto" color="transparent" height="60vh">
        <div v-if="isMounted" class="pr-5" v-for="index in games">
          <v-divider />
          <v-row class="justify-space-between" align="center">
            <v-sheet class="ma-4" color="transparent">
              <p>Score: {{ index.winnerScore }} - {{ index.loserScore }}</p>
              <p>
                Opponent {{ users[index.winnerId].nickname }} -
                {{ users[index.loserId].nickname }}
              </p>
            </v-sheet>
            <v-sheet color="transparent">
              <p>{{ setDuration(index.duration) }}</p>
            </v-sheet>
          </v-row>
        </div>
        <v-sheet height="10vh" class="blur"> </v-sheet>
      </v-sheet>
    </v-sheet>
  </v-container>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import * as lib from '@/utils/lib';

export default {
  props: ['gamesWin', 'gamesLose', 'users'],
  data() {
    return {
      historyGames: [],
      games: [],
      isMounted: false
    };
  },
  async mounted() {
    await this.getGames();
  },
  methods: {
    getGames() {
      this.games.push(...this.gamesWin);
      this.games.push(...this.gamesLose);
      this.isMounted = true;
    },
    setDuration(dateToConvert) {
      return lib.convertDate(dateToConvert);
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
.blur {
  -webkit-mask: linear-gradient(#0000, rgba(0, 0, 0, 1));
  backdrop-filter: blur(4px);
  background-color: transparent;
  position: sticky;
  bottom: 0;
}
</style>
