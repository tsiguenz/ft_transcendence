<template>
  <v-container>
    <p>{{ winnerIsYou ? 'You won' : 'You lost' }}</p>
  </v-container>
</template>

<script>
export default {
  inject: ['sessionStore'],
  props: {
    winnerId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      winnerIsYou: this.sessionStore.userId === this.winnerId
    };
  }
};
</script>
