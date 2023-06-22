<template>
  <v-container>
		<v-btn @click="goToChooseMode()">Go to menu</v-btn>
        <v-img max-height="70%" max-width="70%" v-if="winnerIsYou" src="/assets/icons/you-win.png" />
				<p v-else>you lost</p>
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
		}
	}
};
</script>
