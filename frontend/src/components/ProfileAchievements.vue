<template>
  <div class="font">
    <h2>Achievements</h2>
    <div v-for="(title, description) in achievements.titles">
      <v-divider />
      <ul>
        <h4 class="mt-5">{{ title }}</h4>
      </ul>
      <ul>
        <p class="mb-5">{{ achievements.descriptions[description] }}</p>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      achievements: [],
      test: []
    };
  },
  async mounted() {
    await this.putAchievements();
  },
  methods: {
    async putAchievements() {
      this.achievements = {
        titles: [
          'Super Player',
          'Amazing player',
          'We have a winner',
          'Decade Dominator',
          'Decimation Demolisher'
        ],
        descriptions: [
          'Played 1 game',
          'Played 10 games',
          'Won 1 game',
          'Won 10 games',
          'Won 100 games'
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
