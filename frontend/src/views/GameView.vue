<template>
  <ChooseGameMode
    v-if="isInChooseMode()"
    @queue-ranked="queueRanked"
    @change-status-to-in-menu="setStatusToInMenu()"
  />

  <CustomGameMenu
    v-if="isInMenu()"
    @custom-room-created="subscribeCustomRoomCreated()"
  />

  <WaitingGame v-if="isInQueue()" :is-ranked="isRanked" user-id="" />

  <canvas v-show="isInGame()" id="canvas" height="525" width="858"></canvas>

  <ScoreScreen v-if="isInScoreScreen()" :winner-id="winnerId" />
</template>

<script>
import { GAME_SOCKET_URL } from '../constants';
import SocketioService from '../services/socketio.service';
import ChooseGameMode from '../components/ChooseGameMode.vue';
import CustomGameMenu from '../components/CustomGameMenu.vue';
import WaitingGame from '../components/WaitingGame.vue';
import ScoreScreen from '../components/ScoreScreen.vue';
import * as constants from '@/constants';
import swal from 'sweetalert';

export default {
  components: {
    ChooseGameMode,
    CustomGameMenu,
    WaitingGame,
    ScoreScreen
  },
  data() {
    return {
      statusSocket: null,
      socketioGame: new SocketioService(GAME_SOCKET_URL),
      canvas: null,
      ctx: null,
      ball: null,
      pad1: null,
      pad2: null,
      map: null,
      score: null,
      winnerId: null,
      gameStatus: null,
      isRanked: false
    };
  },
  mounted() {
    this.statusSocket = this.$root.$data.socketioStatus;
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
    this.statusSocket.send('outGame');
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.socketioGame.disconnect();
  },
  methods: {
    queueRanked() {
      this.isRanked = true;
      this.subscribeGameLoop();
      this.subscribeStartGame();
      this.socketioGame.send('connectToRoom');
      this.gameStatus = constants.GAME_STATUS.IN_QUEUE;
    },
    joinCustomGame(gameId) {
      this.subscribeRoomNotFound();
      this.subscribeGameLoop();
      this.subscribeStartGame();
      this.socketioGame.send('joinCustomRoom', gameId);
    },
    runGame() {
      this.statusSocket.send('inGame');
      this.socketioGame.subscribe('gameOver', (res) => {
        this.statusSocket.send('outGame');
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
    subscribeCustomRoomCreated() {
      this.socketioGame.subscribe('customRoomCreated', () => {
        this.isRanked = false;
        this.subscribeGameLoop();
        this.subscribeStartGame();
        this.gameStatus = constants.GAME_STATUS.IN_MENU;
      });
    },
    subscribeRoomNotFound() {
      this.socketioGame.subscribe('roomNotFound', () => {
        swal('Room not found', 'This room does not exist', 'error');
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
      this.ctx.font = '50px Poppins';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(
        this.score.player1.points,
        this.map.width / 2 - 120,
        50
      );
      this.ctx.fillText(this.score.player2.points, this.map.width / 2 + 80, 50);
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
    leaveRoom() {
      this.socketioGame.send('leaveRoom');
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
    },
    setStatusToInMenu() {
      this.gameStatus = constants.GAME_STATUS.IN_MENU;
    },
    setStatusToInChooseMode() {
      this.gameStatus = constants.GAME_STATUS.IN_CHOOSE_MODE;
    },
    setStatusToInQueue() {
      this.gameStatus = constants.GAME_STATUS.IN_QUEUE;
    },
    setStatusToInGame() {
      this.gameStatus = constants.GAME_STATUS.IN_GAME;
    }
  }
};
</script>

<style scoped>
#canvas {
  margin: auto;
  max-width: 70%;
  max-height: 70%;
  background-color: var(--dark-alt);
  border: 3px solid var(--light);
}

.v-container {
  height: 100%;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}
</style>
