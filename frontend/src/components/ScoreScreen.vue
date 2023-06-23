<template>
  <v-container>
    <v-col cols="12">
      <v-img
        class="center"
        v-if="winnerIsYou"
        src="/assets/icons/you-win.png"
      />
      <v-img class="center" v-else src="/assets/icons/you-lose.png" />
      <v-btn class="log center my-8" @click="goToChooseMode()"
        >Play another game</v-btn
      >
    </v-col>
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
  },
  methods: {
    goToChooseMode() {
      this.$parent.setStatusToInChooseMode();
      this.$parent.leaveRoom();
    }
  }
};
</script>

<style>
.center {
  margin: auto;
  max-height: 50%;
  max-width: 50%;
}
</style>
