<template>
  <v-container>
    <p>{{ message }}</p>
    <v-btn v-if="!isRanked" class="log" @click="copyGameUrlToClipboard">
      Copy game URL
    </v-btn>
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
      gameUrl: ''
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
        swall({
          title: 'Copied',
          text: 'Game URL copied to clipboard',
          icon: 'success',
          button: 'OK'
        });
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
    }
  }
};
</script>
