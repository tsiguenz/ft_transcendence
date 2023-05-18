<template>
  <div class="font">
    <h2>History Games</h2>
    <v-container flex>
      <div v-for="(score, index) in historyGames.score">
        <v-divider />
        <v-row class="justify-space-between" align="center">
          <v-sheet class="ma-4" color="transparent">
            <p>Respt: {{ score }}</p>
            <p>Opponent {{ historyGames.opponent[index] }}</p>
          </v-sheet>
          <v-sheet color="transparent">
            <p>{{ historyGames.date[index] }}</p>
          </v-sheet>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      historyGames: [],
      test: []
    };
  },
  async mounted() {
    await this.putHistoryGames();
  },
  methods: {
    async putHistoryGames() {
      this.historyGames = {
        score: [
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1',
          '10 - 1'
        ],
        opponent: [
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz',
          'Tsiguenz'
        ],
        date: [
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023',
          '4/05/2023'
        ]
      };
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
