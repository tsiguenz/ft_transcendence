<template>
  <v-container v-if="!isInQueue">
    <p>Some options</p>
    <v-btn class="pa-2 ma-2" @click="createCustomRoom"
      >Create custom game</v-btn
    >
  </v-container>
  <WaitingGame v-if="isInQueue" :is-ranked="false" />
</template>

<script>
import { GAME_SOCKET_URL } from '../constants';
import SocketioService from '../services/socketio.service';
import swal from 'sweetalert';
import WaitingGame from '../components/WaitingGame.vue';

export default {
  components: {
    WaitingGame
  },
  emits: ['create-custom-room'],
  data() {
    return {
      socketioGame: null,
      inGameView: false,
      alreadyInGame: false,
      isInQueue: false
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
        this.alreadyInGame = true;
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
      if (this.alreadyInGame) return swal('You are already in game!');
      if (!this.inGameView) {
        this.isInQueue = true;
        this.subscribeStartGame();
        this.socketioGame.send('createCustomRoom', this.getCustomGameDatas());
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
    },
    subscribeStartGame() {
      this.socketioGame.subscribe('startGame', () => {
        this.$router.push('/game');
      });
    }
  }
};
</script>
