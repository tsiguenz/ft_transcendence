<template>
  <h1>Game</h1>
  <!--
  <p v-if="ball">ball: {{ ball }}</p>
  <p v-if="pad1">pad1: {{ pad1 }}</p>
  <p v-if="pad2">pad2: {{ pad2 }}</p>
  -->
  <button v-if="!inGame" @click="runGame">Run game (or reconnect)</button>
  <div v-if="!winnerId" v-show="inGame">
    <canvas id="canvas"></canvas>
  </div>
  <p v-if="winnerId">The winner is {{ winnerId }}</p>
</template>

<script>
import { GAME_SOCKET_URL } from '../constants';
import SocketioService from '../services/socketio.service';
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
      inGame: false
    };
  },
  mounted() {},
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.socketioGame.disconnect();
  },
  methods: {
    runGame() {
      this.inGame = true;
      this.socketioGame.setupSocketConnection(this.$cookie.getCookie('jwt'));
      this.socketioGame.subscribe('gameLoop', (datas) => {
        this.ball = datas.ball;
        this.pad1 = datas.pad1;
        this.pad2 = datas.pad2;
        this.map = datas.map;
        this.score = datas.score;
        this.draw();
      });
      this.socketioGame.subscribe('gameOver', (res) => {
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
      this.init();
      //this.sendGameDatas();
      this.socketioGame.send('connectToRoom');
      document.addEventListener('keydown', this.handleKeyDown);
      document.addEventListener('keyup', this.handleKeyUp);
    },
    // function for custom games
    sendGameDatas() {
      const gameDatas = {
        map: this.map,
        ball: this.ball,
        pad1: this.pad1,
        pad2: this.pad2,
        score: this.score
      };
      this.socketioGame.send('initGame', gameDatas);
    },
    init() {
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
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
      console.log(e);
      if (e.key === 'ArrowUp') {
        this.socketioGame.send('movePad', { dy: -1 });
      } else if (e.key === 'ArrowDown') {
        this.socketioGame.send('movePad', { dy: 1 });
      }
    },
    handleKeyUp(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
        this.socketioGame.send('movePad', { dy: 0 });
    }
  }
};
</script>

<style scoped>
div {
  height: 50%;
  width: 50%;
  margin: 0 auto;
}

canvas {
  height: 100%;
  width: 100%;
  background-color: var(--dark-alt);
  border-radius: 30px;
  border: 3px solid var(--light);
}

p {
  text-align: center;
  font-size: 2em;
}

h1 {
  text-align: center;
  font-size: 3em;
}
</style>
