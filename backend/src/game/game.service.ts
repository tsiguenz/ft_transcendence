import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Socket, Server } from 'socket.io';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  gameLoop(datas: any): void {
    if (!datas) return;
    const map = datas.map;
    const ball = datas.ball;
    const pad1 = datas.pad1;
    const pad2 = datas.pad2;
    const score = datas.score;
    if (!map || !ball || !pad1 || !pad2) return;
    this.checkCollision(pad1, pad2, ball, map);
    this.checkGoal(ball, map, score);
    this.moveBall(ball);
    this.movePad(pad1);
    this.movePad(pad2);
  }

  handlePressPadUp(socket: Server, datas: any): void {
    datas.pad1.dy = -1;
  }

  handleReleasePadUp(socket: Server, datas: any): void {
    datas.pad1.dy = 0;
  }

  handlePressPadDown(socket: Server, datas: any): void {
    datas.pad1.dy = 1;
  }

  handleReleasePadDown(socket: Server, datas: any): void {
    datas.pad1.dy = 0;
  }

  moveBall(ball): void {
    if (!ball) return;
    ball.x += ball.dx * ball.speed;
    ball.y += ball.dy * ball.speed;
  }

  movePad(pad: any): void {
    if (!pad || pad.dy === 0) return;
    pad.y += pad.dy * pad.speed;
  }

  checkCollision(pad1: any, pad2: any, ball: any, map: any): void {
    this.checkCollisionPadToBorder(pad1, map);
    this.checkCollisionPadToBorder(pad2, map);
    this.checkCollisionBallToBorder(ball, map);
    this.checkCollisionBallToPad(ball, pad1, map);
    this.checkCollisionBallToPad(ball, pad2, map);
  }

  checkCollisionPadToBorder(pad: any, map: any): void {
    if (
      (this.padIsOnTopBorder(pad) && pad.dy < 0) ||
      (this.padIsOnBottomBorder(pad, map) && pad.dy > 0)
    ) {
      pad.dy = 0;
    }
    // adjust pad position if it's out of the map
    if (this.getBottomPadPosition(pad) > map.height) {
      pad.y = map.height - pad.height;
    }
    if (this.getTopPadPosition(pad) < 0) {
      pad.y = 0;
    }
  }

  checkCollisionBallToBorder(ball: any, map: any): void {
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= map.height) {
      ball.dy *= -1;
    }
    // adjust ball position if it's out of the map
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
    }
    if (ball.y + ball.radius > map.height) {
      ball.y = map.height - ball.radius;
    }
  }

  checkCollisionBallToPad(ball: any, pad: any, map: any): void {
    if (
      this.ballIsBetweenPadX(ball, pad) &&
      this.ballIsBetweenPadY(ball, pad)
    ) {
      this.isPlayerOne(ball, map) ? (ball.dx = -1) : (ball.dx = 1);
      ball.dy = (ball.y - (pad.y + pad.height / 2)) / 10;
    }
  }

  ballIsBetweenPadY(ball: any, pad: any): boolean {
    return (
      ball.y >= this.getTopPadPosition(pad) &&
      ball.y <= this.getBottomPadPosition(pad)
    );
  }

  ballIsBetweenPadX(ball: any, pad: any): boolean {
    return (
      ball.x + ball.radius >= pad.x && ball.x - ball.radius <= pad.x + pad.width
    );
  }

  isPlayerOne(ball: any, map: any): boolean {
    return ball.x > map.height / 2;
  }

  checkGoal(ball: any, map: any, score: any): void {
    if (ball.x <= 0) {
      score.player2 += 1;
      this.resetBall(ball, map);
    }
    if (ball.x >= map.width) {
      score.player1 += 1;
      this.resetBall(ball, map);
    }
  }

  resetBall(ball: any, map: any): void {
    ball.x = map.width / 2;
    ball.y = map.height / 2;
    ball.dx = 1;
    ball.dy = 1;
  }

  padIsOnTopBorder(pad: any): boolean {
    return this.getTopPadPosition(pad) <= 0;
  }

  padIsOnBottomBorder(pad: any, map: any): boolean {
    return this.getBottomPadPosition(pad) >= map.height;
  }

  getTopPadPosition(pad: any): number {
    return pad.y;
  }

  getBottomPadPosition(pad: any): number {
    return pad.y + pad.height;
  }
}
