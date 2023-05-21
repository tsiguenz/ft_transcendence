import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Socket, Server } from 'socket.io';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  gameLoop(datas: any) {
    if (!datas) return;
    let map = datas.map;
    let ball = datas.ball;
    let pad1 = datas.pad1;
    let pad2 = datas.pad2;
    //    this.moveBall(ball);
    this.movePad(pad1, map);
    //    this.movePad(pad2);
    //    this.checkCollision(pad1, pad2, ball);
  }

  handlePressPadUp(socket: Server, datas: any) {
    socket.emit('movePadUp');
    datas.pad1.dy = -1;
  }

  handleReleasePadUp(socket: Server, datas: any) {
    socket.emit('padStop');
    datas.pad1.dy = 0;
  }

  handlePressPadDown(socket: Server, datas: any) {
    socket.emit('movePadDown');
    datas.pad1.dy = 1;
  }

  handleReleasePadDown(socket: Server, datas: any) {
    socket.emit('padStop');
    datas.pad1.dy = 0;
  }
  //
  //  moveBall(ball) {
  //    ball.x += ball.dx * ball.speed;
  //    ball.y += ball.dy * ball.speed;
  //  }
  //
  movePad(pad: any, map: any) {
    if (!pad || pad.dy === 0) return;
    if (
      (this.padIsOnTopBorder(pad, map) && pad.dy < 0) ||
      (this.padIsOnBottomBorder(pad, map) && pad.dy > 0)
    ) {
      pad.dy = 0;
    }
    pad.y += pad.dy * pad.speed;
    if (this.getBottomPadPosition(pad) < 0) {
      pad.y = pad.length / 2;
    }
    if (this.getTopPadPosition(pad) > map.height) {
      pad.y = map.height - pad.height;
    }
  }

  //  checkCollision(pad1: any, pad2: any, ball: any) {
  //    this.checkCollisionPadToBorder(pad1);
  //    this.checkCollisionPadToBorder(pad2);
  //  }
  //
  //  checkCollisionPadToBorder(pad: any) {
  //    if (!this.padIsOnBorder(pad)) return;
  //    this.datas.pad1.dy = 0;
  //  }

  padIsOnTopBorder(pad: any, map: any): boolean {
    return this.getTopPadPosition(pad) <= 0;
  }

  padIsOnBottomBorder(pad: any, map: any): boolean {
    return this.getBottomPadPosition(pad) >= map.height;
  }

  getTopPadPosition(pad: any): number {
    return pad.y - pad.length / 2;
  }

  getBottomPadPosition(pad: any): number {
    return pad.y + pad.length / 2;
  }
}
