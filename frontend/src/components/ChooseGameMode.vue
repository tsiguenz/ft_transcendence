<template>
  <v-container>
    <v-btn class="pa-2 ma-2 log" @click="queueRanked"
      >Search ranked match</v-btn
    >
    <v-btn class="pa-2 ma-2 log" @click="changeStatusToInMenu"
      >Create custom game</v-btn
    >
  </v-container>
</template>

<script>
export default {
  emits: ['queue-ranked', 'change-status-to-in-menu'],
  methods: {
    queueRanked() {
      this.$emit('queue-ranked');
    },
    changeStatusToInMenu() {
      this.$emit('change-status-to-in-menu');
    }
  }
};
</script>
