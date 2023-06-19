<template>
  <v-sheet class="ma-5 font" color="transparent">
    <h2>History Games</h2>
    <v-sheet color="transparent">
      <div v-for="index in games">
        <v-divider />
        <v-sheet class="my-3 py-5" color="transparent">
          <v-row class="align-center justify-space-between">
            <div>
              <ProfileOpponent
                :opponent="getOpponent(index.winnerId, index.loserId)"
              />
            </div>
            <div>
              <p>Score: {{ index.winnerScore }} - {{ index.loserScore }}</p>
              <VariationPoints
                v-if="index.isRanked"
                :game="index"
                :users="users"
                :user="user"
              />
              <p v-else>Custom Game</p>
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
import VariationPoints from './ProfileVariationPoints.vue';
import ProfileClick from './ProfileClick.vue';
import ProfileOpponent from './ProfileOpponent.vue';

export default {
  props: ['games', 'users', 'user'],
  components: {
    ProfileClick,
    VariationPoints,
    ProfileOpponent
  },
  inject: ['connectedUsersStore'],
  data() {
    return {
      connectedUsers: this.connectedUsersStore.connectedUsers
    };
  },
  methods: {
    setDuration(dateToConvert) {
      return lib.convertDate(dateToConvert);
    },
    getOpponent(winnerIndex, loserIndex) {
      const winner = this.getUser(winnerIndex);
      const loser = this.getUser(loserIndex);
      return this.user.nickname == winner.nickname ? loser : winner;
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
