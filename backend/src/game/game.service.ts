import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Socket, Server } from 'socket.io';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  //  handlePressPadUp(socket: Server) {
  //    socket.emit('movePadUp');
  //    this.GAME_DATAS.pad1.dy = -1;
  //  }
  //
  //  handleReleasePadUp(socket: Server) {
  //    socket.emit('padStop');
  //    this.GAME_DATAS.pad1.dy = 0;
  //  }
  //
  //  handlePressPadDown(socket: Server) {
  //    socket.emit('movePadDown');
  //    this.GAME_DATAS.pad1.dy = 1;
  //  }
  //
  //  handleReleasePadDown(socket: Server) {
  //    socket.emit('padStop');
  //    this.GAME_DATAS.pad1.dy = 0;
  //  }
  //
  //  initGame() {
  //    return this.GAME_DATAS;
  //  }
  //
  //  gameLoop() {
  //    let ball = this.GAME_DATAS.ball;
  //    let pad1 = this.GAME_DATAS.pad1;
  //    let pad2 = this.GAME_DATAS.pad2;
  //    this.moveBall(ball);
  //    this.movePad(pad1);
  //    this.movePad(pad2);
  //    this.checkCollision(pad1, pad2, ball);
  //    console.log(this.getTopPadPosition(this.GAME_DATAS.pad1));
  //  }
  //
  //  moveBall(ball) {
  //    ball.x += ball.dx * ball.speed;
  //    ball.y += ball.dy * ball.speed;
  //  }
  //
  //  movePad(pad: any) {
  //    if (this.padIsOnBorder(pad)) {
  //      console.log('collision pad to border');
  //      pad.dy = 0;
  //    }
  //    if (pad.dy === 0) return;
  //    pad.y += pad.dy * pad.speed;
  //    if (this.getBottomPadPosition(pad) < 0) {
  //      pad.y = 0;
  //    }
  //    if (this.getTopPadPosition(pad) > this.HEIGHT) {
  //      pad.y = this.HEIGHT - pad.height;
  //    }
  //  }
  //
  //  checkCollision(pad1: any, pad2: any, ball: any) {
  //    this.checkCollisionPadToBorder(pad1);
  //    this.checkCollisionPadToBorder(pad2);
  //  }
  //
  //  checkCollisionPadToBorder(pad: any) {
  //    if (!this.padIsOnBorder(pad)) return;
  //    this.GAME_DATAS.pad1.dy = 0;
  //  }
  //
  //  padIsOnBorder(pad: any) {
  //    return (
  //      this.getTopPadPosition(pad) <= 0 ||
  //      this.getBottomPadPosition(pad) >= this.HEIGHT
  //    );
  //  }
  //
  //  getTopPadPosition(pad: any) {
  //    return pad.y - pad.height;
  //  }
  //
  //  getBottomPadPosition(pad: any) {
  //    return pad.y + pad.height;
  //  }
}
