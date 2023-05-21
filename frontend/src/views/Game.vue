<template>
  <h1>Game</h1>
  <p v-if="gameDatas">ball: {{ gameDatas.ball }}</p>
  <p v-if="gameDatas">pad1: {{ gameDatas.pad1 }}</p>
  <p v-if="gameDatas">pad2: {{ gameDatas.pad2 }}</p>
  <div>
    <canvas id="canvas"></canvas>
  </div>
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
      height: null,
      width: null,
      gameDatas: null
    };
  },
  created() {
    this.socketioGame.setupSocketConnection(this.$cookie.getCookie('jwt'));
    this.socketioGame.subscribe('initGame', (data) => {
      console.log('initGame');
      this.ball = data.ball;
      this.pad1 = data.pad1;
      this.pad2 = data.pad2;
      this.score = data.score;
      this.map = data.map;
    });
  },
  beforeMount() {
    this.socketioGame.subscribe('movePadUp', () => {
      this.gameDatas.pad1.dy = -1;
      this.gameDatas.pad2.dy = -1;
    });
    this.socketioGame.subscribe('movePadDown', () => {
      this.gameDatas.pad1.dy = 1;
      this.gameDatas.pad2.dy = 1;
    });
    this.socketioGame.subscribe('padStop', () => {
      this.gameDatas.pad1.dy = 0;
      this.gameDatas.pad2.dy = 0;
    });
    this.socketioGame.subscribe('loop', (datas) => {
      this.gameDatas = datas;
      this.draw();
    });
  },
  mounted() {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 38) {
        this.socketioGame.send('pressPadUp');
      } else if (e.keyCode === 40) {
        this.socketioGame.send('pressPadDown');
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 38) {
        this.socketioGame.send('releasePadUp');
      } else if (e.keyCode === 40) {
        this.socketioGame.send('releasePadDown');
      }
    });
    this.runGame();
  },
  beforeUnmount() {
    this.socketioGame.disconnect();
  },
  methods: {
    runGame() {
      this.init();
      this.sendGameDatas();
      this.socketioGame.send('startGame');
    },
    sendGameDatas() {
      this.socketioGame.send('initGame', this.gameDatas);
    },
    init() {
      console.log('init');
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.height = this.canvas.height;
      this.width = this.canvas.width;
      // TODO: create input to choose game parameters
      this.gameDatas = {
        map: {
          height: this.height,
          width: this.width
        },
        ball: {
          x: this.width / 2,
          y: this.height / 2,
          speed: 1,
          dx: 1,
          dy: 1
        },
        pad1: {
          x: 0,
          y: this.height / 2,
          length: this.height / 4,
          speed: 1,
          dy: 0
        },
        pad2: {
          x: this.width,
          y: this.height / 2,
          length: this.height / 4,
          speed: 1,
          dy: 0
        },
        score: {
          player1: 0,
          player2: 0
        }
      };
    },
    draw() {
      this.ctx.clearRect(
        0,
        0,
        this.gameDatas.map.width,
        this.gameDatas.map.height
      );
      this.writeScore();
      this.createCenterDotLine();
      //      this.drawBall();
      this.drawPad(this.gameDatas.pad1);
      this.drawPad(this.gameDatas.pad2);
    },
    createCenterDotLine() {
      this.ctx.beginPath();
      this.ctx.setLineDash([5, 15]);
      this.ctx.moveTo(this.gameDatas.map.width / 2, 0);
      this.ctx.lineTo(this.gameDatas.map.width / 2, this.gameDatas.map.height);
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
      this.ctx.fillStyle = this.ball.color;
      this.ctx.fill();
    },
    drawPad(pad) {
      this.ctx.beginPath();
      this.ctx.rect(0, pad.y - pad.length / 2, 5, pad.length);
      this.ctx.closePath();
      this.ctx.fillStyle = 'white';
      this.ctx.fill();
    },
    writeScore() {
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(
        this.gameDatas.score.player1,
        this.gameDatas.map.width / 2 - 25,
        20
      );
      this.ctx.fillText(
        this.gameDatas.score.player2,
        this.gameDatas.map.width / 2 + 15,
        20
      );
    },
    movePad(pad) {
      pad.y += pad.dy * pad.speed;
    },
    moveBall() {
      this.ball.x += this.ball.dx * this.ball.speed;
      this.ball.y += this.ball.dy * this.ball.speed;
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
  background-color: black;
}
p {
  text-align: center;
  font-size: 2em;
}
</style>
