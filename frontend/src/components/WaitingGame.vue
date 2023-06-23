<template>
  <v-container>
    <v-col cols="12">
      <v-row justify="center">
        <v-sheet
          v-if="!isRanked && urlIsCopy"
          width="90%"
          class="sheet pa-5 my-5"
        >
          <p class="font">Game URL copied, give it to your opponent</p>
        </v-sheet>
        <v-sheet
          v-if="isRanked || urlIsCopy"
          width="90%"
          class="sheet pa-5 my-5"
        >
          <h2 class="font">{{ message }}</h2>
          <v-progress-linear color="white" indeterminate />
        </v-sheet>
      </v-row>
      <v-row justify="center" width="100%">
        <v-btn
          v-if="!isRanked && !urlIsCopy"
          class="btn pa-5 my-5"
          width="90%"
          @click="copyGameUrlToClipboard"
        >
          Copy game URL
        </v-btn>
        <v-btn class="btn pa-5 my-5" width="90%" @click="goToChooseMode()"
          >Back to game menu</v-btn
        >
      </v-row>
    </v-col>
  </v-container>
</template>

<script>
import * as constants from '@/constants.ts';
import swall from 'sweetalert';
export default {
  props: {
    isRanked: Boolean,
    gameId: {
      type: String,
      default: ''
    }
  },
  emits: ['create-custom-room'],
  data() {
    return {
      message: '',
      gameUrl: '',
      urlIsCopy: false
    };
  },
  mounted() {
    if (this.isRanked) {
      this.message = 'Waiting for an opponent';
    } else {
      this.message = 'Waiting for your opponent';
      this.gameUrl = constants.GAME_CUSTOM_URL + this.gameId;
    }
  },
  methods: {
    async copyGameUrlToClipboard() {
      try {
        await navigator.clipboard.writeText(this.gameUrl);
        this.urlIsCopy = true;
      } catch (err) {
        swall({
          title: 'Error',
          text:
            'Failed to copy game URL to clipboard, please copy it manually: ' +
            this.gameUrl,
          icon: 'error',
          button: 'OK'
        });
      }
    },
    goToChooseMode() {
      const gameView = this.isRanked ? this.$parent : this.$parent.$parent;
      gameView.setStatusToInChooseMode();
      gameView.leaveRoom();
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
  text-align: center;
}
.sheet {
  background-color: var(--dark-purple);
  border-style: solid;
  border-radius: 2px;
  box-shadow: 5px 5px 5px var(--light-purple) !important;
  border-color: var(--light-purple) !important;
}
.btn {
  background-image: linear-gradient(
    to right,
    var(--light) 0%,
    var(--dark-purple) 51%,
    var(--light) 100%
  );
  width: 250px;
  bottom: 0;
  text-align: center;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  border-radius: 5px;
  display: flex;
}
</style>
