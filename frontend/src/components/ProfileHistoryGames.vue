<template>
  <v-sheet class="font" color="transparent">
    <h2 class="mb-5">History Games</h2>
    <v-sheet class="overflow-y-auto" ref="myElement" color="transparent">
      <div v-if="isMounted" class="pr-5" v-for="index in games">
        <v-divider />
        <v-row class="justify-space-between" align="center">
          <v-sheet class="ma-4" color="transparent">
            <p>Score: {{ index.winnerScore }} - {{ index.loserScore }}</p>
            <p>
              Opponent {{ getUser(index.winnerId) }} -
              {{ getUser(index.loserId) }}
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
    this.findBottom();
  },
  methods: {
    getGames() {
      this.games.push(...this.gamesWin);
      this.games.push(...this.gamesLose);
      this.isMounted = true;
    },
    setDuration(dateToConvert) {
      return lib.convertDate(dateToConvert);
    },
    findBottom() {
      const element = this.$refs.myElement.$el;
      const rect = element.getBoundingClientRect();
      const height = rect.top + window.pageYOffset;
      element.style.height = `calc(100vh - ${height}px)`;
    },
    getUser(index) {
      return this.users.filter((users) => users.id == index)[0].nickname;
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
