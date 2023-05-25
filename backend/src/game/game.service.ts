import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService, private auth: AuthService) {}

  async gameLoop(rooms: any, roomId: string) {
    const room = rooms.get(roomId);
    const datas = room.datas;
    if (!datas) return null;
    const map = datas.map;
    const ball = datas.ball;
    const pad1 = datas.pad1;
    const pad2 = datas.pad2;
    const score = datas.score;
    if (!map || !ball || !pad1 || !pad2) return null;
    this.checkCollision(pad1, pad2, ball, map);
    this.checkGoal(ball, map, score);
    this.moveBall(ball);
    this.movePad(pad1);
    this.movePad(pad2);
    if (this.isGameEnded(score)) return await this.stopGame(rooms, roomId);
    return null;
  }

  async stopGame(rooms: any, roomId: string): Promise<any> {
    const room = rooms.get(roomId);
    const score = room.datas.score;
    clearInterval(room.interval);
    await this.storeDataToDb(room, roomId);
    rooms.delete(roomId);
    return score;
  }

  async storeDataToDb(room: any, roomId: string): Promise<void> {
    const score = room.datas.score;
    const player1 = score.player1;
    const player2 = score.player2;
    const winner = player1.points > player2.points ? player1 : player2;
    const loser = winner.id === player1.id ? player2 : player1;
    await this.prisma.game.create({
      data: {
        id: roomId,
        isRanked: room.datas.isRanked,
        winnerId: winner.id,
        loserId: loser.id,
        previousWinnerRating: 0,
        previousLoserRating: 0,
        winnerScore: winner.points,
        loserScore: loser.points
      }
    });
  }

  handleMovePad(userId: string, data: any, dy: number): void {
    const pad = userId === data.score.player1.id ? data.pad1 : data.pad2;
    pad.dy = dy;
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
      score.player2.points += 1;
      this.resetBall(ball, map);
    }
    if (ball.x >= map.width) {
      score.player1.points += 1;
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

  isUserAlreadyInRoom(userId: string, rooms: any): boolean {
    const it = rooms[Symbol.iterator]();
    for (const room of it) {
      if (room[1].players.find((player) => player === userId)) return true;
    }
    return false;
  }

  getRoomIdByUserId(userId: string, rooms: any): string {
    const it = rooms[Symbol.iterator]();
    for (const room of it) {
      if (room[1].players.find((player) => player === userId)) return room[0];
    }
    return null;
  }

  async setDecodedTokenToClient(client: Socket): Promise<number> {
    const token = client.handshake.auth.token;
    if (!token) {
      client.disconnect();
      return 1;
    }
    try {
      client['decoded'] = await this.auth.verifyJwt(token);
    } catch (error) {
      client.disconnect();
      return 1;
    }
    return 0;
  }

  getJoinableRoom(rooms: any): string {
    const it = rooms[Symbol.iterator]();
    for (const room of it)
      if (room[1].players.length === 1 && !room[1].isStarted) return room[0];
    return null;
  }

  createRoom(rooms: any, userId: string): string {
    const room = {
      id: uuidv4(),
      players: [userId]
    };
    rooms.set(room.id, {
      interval: null,
      isStarted: false,
      players: room.players,
      datas: {}
    });
    return room.id;
  }

  isGameEnded(score: any): boolean {
    return score.player1.points === 3 || score.player2.points === 3;
  }

  getDatasFromRoom(rooms: any, roomId: string): any {
    const room = rooms.get(roomId);
    return room.datas;
  }

  initDatas(rooms: any, roomId: string): void {
    const room = rooms.get(roomId);
    const map = {
      height: 150,
      width: 300,
      padOffset: 10
    };
    const padInfos = {
      height: map.height / 5,
      width: map.width / 100,
      speed: 1
    };
    const ball = {
      x: map.width / 2,
      y: map.height / 2,
      radius: 3,
      speed: 1,
      dx: 1,
      dy: 1
    };
    const pad1 = {
      x: map.padOffset,
      y: map.height / 2 - padInfos.height / 2,
      height: padInfos.height,
      width: padInfos.width,
      speed: padInfos.speed,
      dy: 0
    };
    const pad2 = {
      x: map.width - padInfos.width - map.padOffset,
      y: map.height / 2 - padInfos.height / 2,
      height: padInfos.height,
      width: padInfos.width,
      speed: padInfos.speed,
      dy: 0
    };
    const score = {
      player1: { id: room.players[0], points: 0 },
      player2: { id: room.players[1], points: 0 }
    };
    room.datas = {
      map: map,
      ball: ball,
      pad1: pad1,
      pad2: pad2,
      score: score,
      isRanked: true
    };
  }
}
