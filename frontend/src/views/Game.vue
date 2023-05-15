<template>
  <h1>Game</h1>
  <div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      canvas: null,
      ctx: null,
      maxHeight: null,
      maxWidth: null,
      ball: {
        x: 0,
        y: 0,
        radius: 4,
        color: 'white',
        speed: 1,
        dx: 1,
        dy: 1,
        deviation: 0.5
      },
      pad1: {
        x: 0,
        y: 0,
        width: 3,
        height: 30,
        color: 'white',
        speed: 5,
        dx: 1,
        dy: 1
      },
      pad2: {
        x: 0,
        y: 0,
        width: 3,
        height: 30,
        color: 'white',
        speed: 5,
        dx: 1,
        dy: 1
      },
      score: {
        player1: 0,
        player2: 0
      }
    };
  },
  mounted() {
    this.init();
    this.draw();
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 38) {
        this.movePad(this.pad2, 'up');
      } else if (e.keyCode === 40) {
        this.movePad(this.pad2, 'down');
      } else if (e.keyCode === 87) {
        this.movePad(this.pad1, 'up');
      } else if (e.keyCode === 83) {
        this.movePad(this.pad1, 'down');
      }
    });
    setInterval(this.draw, 10);
  },
  methods: {
    init() {
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.maxHeight = this.canvas.height;
      this.maxWidth = this.canvas.width;
      this.ball.x = this.maxWidth / 2;
      this.ball.y = this.maxHeight / 2;
      this.pad1.x = 10;
      this.pad1.y = this.maxHeight / 2 - this.pad1.height / 2;
      this.pad2.x = this.maxWidth - 10 - this.pad2.width / 2;
      this.pad2.y = this.maxHeight / 2 - this.pad2.height / 2;
    },
    createCenterDotLine() {
      this.ctx.beginPath();
      this.ctx.setLineDash([5, 15]);
      this.ctx.moveTo(this.maxWidth / 2, 0);
      this.ctx.lineTo(this.maxWidth / 2, this.maxHeight);
      this.ctx.strokeStyle = 'white';
      this.ctx.stroke();
    },
    draw() {
      this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);
      this.writeScoreInCtx();
      this.createCenterDotLine();
      this.checkBallCollisionWithBorder();
      this.checkPadCollisionWithBorder();
      this.checkBallCollisionWithPad();
      this.checkGoal();
      this.moveBall();
      this.drawBall();
      this.drawPad(this.pad1);
      this.drawPad(this.pad2);
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
      this.ctx.fillStyle = pad.color;
      this.ctx.fill();
    },
    movePad(pad, direction) {
      if (direction === 'up') {
        pad.y -= pad.speed;
      } else if (direction === 'down') {
        pad.y += pad.speed;
      }
    },
    moveBall() {
      this.ball.x += this.ball.dx * this.ball.speed;
      this.ball.y += this.ball.dy * this.ball.speed;
    },
    checkBallCollisionWithPad() {
      if (
        this.ball.x + this.ball.radius >= this.pad2.x &&
        this.ball.x + this.ball.radius <= this.pad2.x + this.pad2.width &&
        this.ball.y - this.ball.radius >= this.pad2.y &&
        this.ball.y + this.ball.radius <= this.pad2.y + this.pad2.height
      ) {
        this.ball.dx = -this.ball.dx;
        this.ball.dy += this.ball.deviation * this.pad2.dy;
        this.ball.speed += 0.1;
      }
      if (
        this.ball.x - this.ball.radius <= this.pad1.x + this.pad1.width &&
        this.ball.x - this.ball.radius >= this.pad1.x &&
        this.ball.y - this.ball.radius >= this.pad1.y &&
        this.ball.y + this.ball.radius <= this.pad1.y + this.pad1.height
      ) {
        this.ball.dx = -this.ball.dx;
        this.ball.dy += this.ball.deviation * this.pad1.dy;
        this.ball.speed += 0.1;
      }
    },
    checkBallCollisionWithBorder() {
      if (
        this.ball.x + this.ball.radius > this.maxWidth ||
        this.ball.x - this.ball.radius < 0
      ) {
        this.ball.dx = -this.ball.dx;
      }
      if (
        this.ball.y + this.ball.radius > this.maxHeight ||
        this.ball.y - this.ball.radius < 0
      ) {
        this.ball.dy = -this.ball.dy;
      }
    },
    checkPadCollisionWithBorder() {
      if (this.pad1.y + this.pad1.height >= this.maxHeight) {
        this.pad1.y = this.maxHeight - this.pad1.height;
      }
      if (this.pad1.y < 0) {
        this.pad1.y = 0;
      }
      if (this.pad2.y + this.pad2.height >= this.maxHeight) {
        this.pad2.y = this.maxHeight - this.pad2.height;
      }
      if (this.pad2.y < 0) {
        this.pad2.y = 0;
      }
    },
    checkGoal() {
      if (this.ball.x + this.ball.radius > this.pad2.x + 10) {
        this.resetBall();
        this.score.player1++;
      }
      if (this.ball.x - this.ball.radius < this.pad1.x - 10) {
        this.resetBall();
        this.score.player2++;
      }
    },
    resetBall() {
      this.ball.x = this.maxWidth / 2;
      this.ball.y = this.maxHeight / 2;
      this.ball.dx = 1;
      this.ball.dy = 1;
      this.ball.speed = 1;
    },
    writeScoreInCtx() {
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(this.score.player1, this.maxWidth / 2 - 25, 20);
      this.ctx.fillText(this.score.player2, this.maxWidth / 2 + 15, 20);
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
