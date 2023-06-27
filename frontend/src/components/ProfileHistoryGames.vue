<template>
  <v-sheet class="ma-5 font" color="transparent">
    <h2>History Games</h2>
    <v-sheet color="transparent">
      <div v-for="index in games" :key="index.id">
        <v-divider />
        <v-sheet class="my-3 py-5" color="transparent">
          <v-row class="align-center justify-space-between">
            <v-sheet width="40%" color="transparent">
              <ProfileOpponent
                :opponent="getOpponent(index.winnerId, index.loserId)"
              />
            </v-sheet>
            <v-sheet width="50%" color="transparent">
              <p>Score: {{ index.winnerScore }} - {{ index.loserScore }}</p>
              <VariationPoints
                v-if="index.isRanked"
                :game="index"
                :users="users"
                :user="user"
              />
              <p v-else>
                Custom game
                <span v-if="user.id === index.winnerId"> won !</span>
                <span v-else> lost</span>
              </p>
              <p>Date: {{ setDuration(index.createdAt) }}</p>
            </v-sheet>
          </v-row>
        </v-sheet>
      </div>
    </v-sheet>
  </v-sheet>
</template>

<script>
import * as lib from '@/utils/lib';
import VariationPoints from './ProfileVariationPoints.vue';
import ProfileOpponent from './ProfileOpponent.vue';

export default {
  components: {
    VariationPoints,
    ProfileOpponent
  },
  inject: ['connectedUsersStore'],
  props: ['games', 'users', 'user'],
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
