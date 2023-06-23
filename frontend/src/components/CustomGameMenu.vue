<template>
  <v-container v-if="!isInQueue" class="d-flex flex-column">
    <v-slider
      v-model="customGameDatas.ballSpeed"
      class="slider-label"
      :label="`Ball speed: ${customGameDatas.ballSpeed}`"
      min="0.5"
      max="10"
      :step="0.1"
    />
    <v-slider
      v-model="customGameDatas.ballAcceleration"
      class="slider-label"
      :label="`Ball acceleration: ${customGameDatas.ballAcceleration}`"
      min="1"
      max="1.5"
      :step="0.05"
    />
    <v-slider
      v-model="customGameDatas.ballRadius"
      class="slider-label"
      :label="`Ball radius: ${customGameDatas.ballRadius}`"
      min="1"
      max="20"
      :step="1"
    />
    <v-slider
      v-model="customGameDatas.padHeight"
      class="slider-label"
      :label="`Pad height: ${customGameDatas.padHeight}`"
      min="30"
      max="200"
      :step="5"
    />
    <v-slider
      v-model="customGameDatas.padWidth"
      class="slider-label"
      :label="`Pad width: ${customGameDatas.padWidth}`"
      min="1"
      max="20"
      :step="1"
    />
    <v-slider
      v-model="customGameDatas.padSpeed"
      class="slider-label"
      :label="`Pad speed: ${customGameDatas.padSpeed}`"
      min="1"
      max="10"
      :step="1"
    />
    <v-slider
      v-model="customGameDatas.maxScore"
      class="slider-label"
      :label="`Max score: ${customGameDatas.maxScore}`"
      min="1"
      max="10"
      :step="1"
    />
    <v-btn class="log mt-5" @click="createCustomRoom()"
      >Create custom game</v-btn
    >
    <v-btn class="log mt-5" @click="goToChooseMode()">Back to game menu</v-btn>
  </v-container>
  <WaitingGame v-if="isInQueue" :game-id="gameId" />
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
  emits: ['custom-room-created'],
  data() {
    return {
      socketioGame: null,
      gameId: '',
      inGameView: false,
      alreadyInGame: false,
      isInQueue: false,
      customGameDatas: {
        ballSpeed: 3,
        ballAcceleration: 1.05,
        ballRadius: 8,
        padHeight: 70,
        padWidth: 8,
        padSpeed: 5,
        maxScore: 5
      }
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
      this.subscribeCustomRoomCreated();
      if (!this.inGameView) this.subscribeStartGame();
      this.socketioGame.send('createCustomRoom', this.customGameDatas);
      this.$emit('custom-room-created');
    },
    subscribeStartGame() {
      this.socketioGame.subscribe('startGame', (payload) => {
        this.$router.push('/game/' + payload.gameId);
      });
    },
    subscribeCustomRoomCreated() {
      this.socketioGame.subscribe('customRoomCreated', (payload) => {
        this.isInQueue = true;
        this.gameId = payload.gameId;
      });
    },
    goToChooseMode() {
      this.$parent.setStatusToInChooseMode();
    }
  }
};
</script>

<style lang="scss" scoped>
.slider-label {
  font-family: 'Poppins';
  font-weight: bold;
}
</style>
