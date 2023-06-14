<template>
  <v-sheet class="font" color="transparent">
    <h2>History Games</h2>
    <v-sheet color="transparent">
      <div v-if="isMounted" class="pr-5" v-for="index in games">
        <v-divider />
        <v-row class="justify-space-between" align="center">
          <v-sheet class="ma-4" color="transparent">
            <p>Score: {{ index.winnerScore }} - {{ index.loserScore }}</p>
            <p>Opponent: {{ getUser(index.winnerId, index.loserId) }}</p>
          </v-sheet>
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
    },
    setDuration(dateToConvert) {
      return lib.convertDate(dateToConvert);
    },
    getUser(winnerIndex, loserIndex) {
      const winnerNickname = this.users.filter(
        (users) => users.id == winnerIndex
      )[0].nickname;
      const loserNickname = this.users.filter(
        (users) => users.id == loserIndex
      )[0].nickname;
      return this.user.nickname == winnerNickname
        ? loserNickname
        : winnerNickname;
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
