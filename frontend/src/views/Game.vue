<template>
  <v-container v-if="isInChooseMode()">
    <v-btn class="pa-2 ma-2" @click="queueRanked">Search ranked match</v-btn>
    <v-btn class="pa-2 ma-2" @click="gameStatus = 1">Custom game</v-btn>
    <input
      v-model="gameId"
      style="border: 2px solid black"
      class="pa-2 ma-2"
      type="text"
    />
    <v-btn class="pa-2 ma-2" @click="joinCustomGame">Join custom game</v-btn>
  </v-container>

  <v-container v-if="isInMenu()">
    <v-row justify="center" align="center">
      <!--
      <v-text-field type="text" v-model="custom.ballSpeed"> </v-text-field>
      -->
      <p>Some options</p>
      <v-btn class="pa-2 ma-2" @click="createCustomRoom"
        >Create custom game</v-btn
      >
    </v-row>
  </v-container>

  <v-container v-if="isInQueue()">
    <v-row justify="center" align="center">
      <p>Waiting for an opponent</p>
    </v-row>
  </v-container>

  <v-container v-show="isInGame()">
    <canvas id="canvas" height="150" width="300"></canvas>
  </v-container>

  <v-container v-if="isInScoreScreen()">
    <v-row justify="center" align="center">
      <p>The winner is {{ winnerId }}</p>
    </v-row>
  </v-container>
</template>

<script>
import { GAME_SOCKET_URL } from '../constants';
import SocketioService from '../services/socketio.service';
import * as constants from '@/constants';
export default {
  data() {
    return {
      socketioGame: new SocketioService(GAME_SOCKET_URL),
      canvas: null,
      ctx: null,
      ball: null,
      pad1: null,
      pad2: null,
      map: null,
      score: null,
      winnerId: null,
      gameId: null,
      gameStatus: null
    };
  },
  mounted() {
    this.socketioGame.setupSocketConnection(this.$cookie.getCookie('jwt'));
    this.socketioGame.subscribe('alreadyInGame', () => {
      this.gameStatus = constants.GAME_STATUS.IN_GAME;
      this.socketioGame.send('connectToRoom');
      this.subscribeGameLoop();
      this.runGame();
    });
    if (this.$route.params.id) {
      const gameId = this.$route.params.id;
      this.joinCustomGame(gameId);
    } else this.gameStatus = constants.GAME_STATUS.IN_CHOOSE_MODE;
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.socketioGame.disconnect();
  },
  methods: {
    queueRanked() {
      this.subscribeGameLoop();
      this.subscribeStartGame();
      this.socketioGame.send('connectToRoom');
      this.gameStatus = constants.GAME_STATUS.IN_QUEUE;
    },
    createCustomRoom() {
      this.subscribeGameLoop();
      this.subscribeStartGame();
      this.socketioGame.send('createCustomRoom', this.getCustomGameDatas());
      this.gameStatus = constants.GAME_STATUS.IN_QUEUE;
    },
    joinCustomGame(gameId) {
      this.subscribeRoomNotFound();
      this.subscribeGameLoop();
      this.subscribeStartGame();
      this.socketioGame.send('joinCustomRoom', gameId);
    },
    runGame() {
      this.socketioGame.subscribe('gameOver', (res) => {
        this.gameStatus = constants.GAME_STATUS.IN_SCORE_SCREEN;
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.canvas = null;
        this.ctx = null;
        const score = res.score;
        this.winnerId =
          score.player1.points > score.player2.points
            ? score.player1.id
            : score.player2.id;
      });
      this.initCanvas();
      document.addEventListener('keydown', this.handleKeyDown);
      document.addEventListener('keyup', this.handleKeyUp);
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
    initCanvas() {
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
    },
    subscribeGameLoop() {
      this.socketioGame.subscribe('gameLoop', (datas) => {
        this.ball = datas.ball;
        this.pad1 = datas.pad1;
        this.pad2 = datas.pad2;
        this.map = datas.map;
        this.score = datas.score;
        this.draw();
      });
    },
    subscribeStartGame() {
      this.socketioGame.subscribe('startGame', (datas) => {
        this.gameStatus = constants.GAME_STATUS.IN_GAME;
        this.ball = datas.ball;
        this.pad1 = datas.pad1;
        this.pad2 = datas.pad2;
        this.map = datas.map;
        this.score = datas.score;
        this.runGame();
      });
    },
    subscribeRoomNotFound() {
      this.socketioGame.subscribe('roomNotFound', () => {
        this.gameStatus = constants.GAME_STATUS.IN_CHOOSE_MODE;
        this.$router.push({ name: 'Game' });
      });
    },
    draw() {
      if (!this.map) return;
      this.ctx.clearRect(0, 0, this.map.width, this.map.height);
      this.writeScore();
      this.createCenterDotLine();
      this.drawBall();
      this.drawPad(this.pad1);
      this.drawPad(this.pad2);
    },
    createCenterDotLine() {
      this.ctx.beginPath();
      this.ctx.setLineDash([5, 15]);
      this.ctx.moveTo(this.map.width / 2, 0);
      this.ctx.lineTo(this.map.width / 2, this.map.height);
      this.ctx.strokeStyle = 'white';
      this.ctx.stroke();
    },
    drawBall() {
      this.ctx.beginPath();
      this.ctx.arc(
        this.ball.x,
        this.ball.y,
        this.ball.radius,
        0,
        Math.PI * 2,
        true
      );
      this.ctx.closePath();
      this.ctx.fillStyle = 'white';
      this.ctx.fill();
    },
    drawPad(pad) {
      this.ctx.beginPath();
      this.ctx.rect(pad.x, pad.y, pad.width, pad.height);
      this.ctx.closePath();
      this.ctx.fillStyle = 'white';
      this.ctx.fill();
    },
    writeScore() {
      this.ctx.font = '20px Poppins';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(this.score.player1.points, this.map.width / 2 - 25, 20);
      this.ctx.fillText(this.score.player2.points, this.map.width / 2 + 15, 20);
    },
    handleKeyDown(e) {
      if (e.key === 'ArrowUp') {
        this.socketioGame.send('movePad', { dy: constants.PAD_UP });
      } else if (e.key === 'ArrowDown') {
        this.socketioGame.send('movePad', { dy: constants.PAD_DOWN });
      }
    },
    handleKeyUp(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
        this.socketioGame.send('movePad', { dy: constants.PAD_STOP });
    },
    isInGame() {
      return this.gameStatus === constants.GAME_STATUS.IN_GAME;
    },
    isInMenu() {
      return this.gameStatus === constants.GAME_STATUS.IN_MENU;
    },
    isInQueue() {
      return this.gameStatus === constants.GAME_STATUS.IN_QUEUE;
    },
    isInScoreScreen() {
      return this.gameStatus === constants.GAME_STATUS.IN_SCORE_SCREEN;
    },
    isInChooseMode() {
      return this.gameStatus === constants.GAME_STATUS.IN_CHOOSE_MODE;
    }
  }
};
</script>

<style scoped>
div {
  height: 50%;
  width: 50%;
  margin: 0 auto;
  border: 3px solid var(--light);
}

canvas {
  height: 100%;
  width: 100%;
  background-color: var(--dark-alt);
  border-radius: 30px;
  border: 3px solid var(--light);
}
</style>
