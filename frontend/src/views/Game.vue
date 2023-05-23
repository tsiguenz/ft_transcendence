<template>
  <h1>Game</h1>
  <!--
  <p v-if="ball">ball: {{ ball }}</p>
  <p v-if="pad1">pad1: {{ pad1 }}</p>
  <p v-if="pad2">pad2: {{ pad2 }}</p>
  -->
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
      ball: null,
      pad1: null,
      pad2: null,
      map: null,
      score: null
    };
  },
  created() {
    this.socketioGame.setupSocketConnection(this.$cookie.getCookie('jwt'));
  },
  beforeMount() {
    this.socketioGame.subscribe('loop', (datas) => {
      this.ball = datas.ball;
      this.pad1 = datas.pad1;
      this.pad2 = datas.pad2;
      this.map = datas.map;
      this.score = datas.score;
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
      // TODO: create input to choose game parameters
      this.map = {
        height: this.canvas.height,
        width: this.canvas.width,
        padOffset: 10
      };
      const padInfos = {
        height: this.map.height / 5,
        width: this.map.width / 100,
        speed: 1
      };
      this.ball = {
        x: this.map.width / 2,
        y: this.map.height / 2,
        radius: 5,
        speed: 3,
        dx: 1,
        dy: 1
      };
      this.pad1 = {
        x: 0,
        y: this.map.height / 2 - padInfos.height / 2,
        height: padInfos.height,
        width: padInfos.width,
        speed: padInfos.speed,
        dy: 0
      };
      this.pad2 = {
        x: this.map.width - padInfos.width,
        y: this.map.height / 2 - padInfos.height / 2,
        height: padInfos.height,
        width: padInfos.width,
        speed: padInfos.speed,
        dy: 0
      };
      this.score = {
        player1: 0,
        player2: 0
      };
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
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(this.score.player1, this.map.width / 2 - 25, 20);
      this.ctx.fillText(this.score.player2, this.map.width / 2 + 15, 20);
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

h1 {
  text-align: center;
  font-size: 3em;
}
</style>
