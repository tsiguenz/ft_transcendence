<template>
  <h1>Game</h1>
  <p>ball: {{ ball }}</p>
  <p>pad1: {{ pad1 }}</p>
  <p>pad2: {{ pad2 }}</p>
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
      this.pad1.dy = -1;
      this.pad2.dy = -1;
    });
    this.socketioGame.subscribe('movePadDown', () => {
      this.pad1.dy = 1;
      this.pad2.dy = 1;
    });
    this.socketioGame.subscribe('padStop', () => {
      this.pad1.dy = 0;
      this.pad2.dy = 0;
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
      console.log('runGame');
      this.init();
      this.sendGameDatas();
      //setInterval(this.draw, this.gameDatas.map.refreshRate);
    },
    sendGameDatas() {
      console.log(this.gameDatas);
      this.socketioGame.send('initGame', this.gameDatas);
    },
    init() {
      console.log('init');
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.height = this.canvas.height;
      this.width = this.canvas.width;
      this.gameDatas = {
        map: {
          height: this.height,
          width: this.width,
          refreshRate: 100
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
        }
      };
    },
    draw() {
      this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);
      this.writeScoreInCtx();
      this.createCenterDotLine();
      this.movePad(this.pad1);
      this.movePad(this.pad2);
      this.drawBall();
      this.drawPad(this.pad1);
      this.drawPad(this.pad2);
    },
    createCenterDotLine() {
      this.ctx.beginPath();
      this.ctx.setLineDash([5, 15]);
      this.ctx.moveTo(this.maxWidth / 2, 0);
      this.ctx.lineTo(this.maxWidth / 2, this.maxHeight);
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
      this.ctx.rect(pad.x, pad.y, pad.width, pad.height);
      this.ctx.closePath();
      this.ctx.fillStyle = 'white';
      this.ctx.fill();
    },
    writeScoreInCtx() {
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(this.score.player1, this.maxWidth / 2 - 25, 20);
      this.ctx.fillText(this.score.player2, this.maxWidth / 2 + 15, 20);
    },
    movePad(pad) {
      pad.y += pad.dy * pad.speed;
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
