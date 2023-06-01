<template>
  <v-container>
    <p>Some options</p>
    <v-btn class="pa-2 ma-2" @click="createCustomRoom"
      >Create custom game</v-btn
    >
  </v-container>
</template>

<script>
import { GAME_SOCKET_URL } from '../constants';
import SocketioService from '../services/socketio.service';
import swal from 'sweetalert';

export default {
  emits: ['create-custom-room'],
  data() {
    return {
      socketioGame: null,
      inGameView: false
    };
  },
  mounted() {
    if (this.$parent.socketioGame) {
      this.inGameView = true;
      this.socketioGame = this.$parent.socketioGame;
    } else {
      this.socketioGame = new SocketioService(GAME_SOCKET_URL);
      this.socketioGame.setupSocketConnection(this.$cookie.getCookie('jwt'));
      this.socketioGame.subscribe('alreadyInGame', () => {
        swal('You are already in game');
      });
    }
  },
  beforeUnmount() {
    if (!this.inGameView) {
      this.socketioGame.disconnect();
    }
  },
  methods: {
    createCustomRoom() {
      if (!this.inGameView) {
        this.socketioGame.send('createCustomRoom', this.getCustomGameDatas());
        this.$router.push({ name: 'Game' });
      } else {
        this.$emit('create-custom-room');
      }
    },
    getCustomGameDatas() {
      return {
        ballAcceleration: 2,
        padHeight: 150 / 2,
        padWidth: 300 / 100,
        padSpeed: 2,
        ballRadius: 1,
        ballSpeed: 2
      };
    }
  }
};
</script>
