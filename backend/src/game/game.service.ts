import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import {
  MapInfos,
  Ball,
  Pad,
  GameDatas,
  Score,
  Room,
  Player,
  CustomDatas
} from './interfaces/game.interfaces';

@Injectable()
export class GameService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
    private user: UsersService
  ) {}

  async gameIteration(
    rooms: Map<string, Room>,
    roomId: string
  ): Promise<Score> {
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

  async gameLoop(joinableRoom: string, that: any): Promise<void> {
    const res = await this.gameIteration(that.rooms, joinableRoom);
    const room = that.rooms.get(joinableRoom);
    if (!res) that.server.in(joinableRoom).emit('gameLoop', room.datas);
    else {
      that.logger.log(`Game is over: ${joinableRoom}`);
      that.server.in(joinableRoom).emit('gameOver', { score: res });
    }
  }

  async stopGame(rooms: Map<string, Room>, roomId: string): Promise<Score> {
    const room = rooms.get(roomId);
    const score = room.datas.score;
    clearInterval(room.interval);
    await this.storeDataToDb(room, roomId);
    rooms.delete(roomId);
    return score;
  }

  async storeDataToDb(room: Room, roomId: string): Promise<void> {
    const score = room.datas.score;
    const player1 = score.player1;
    const player2 = score.player2;
    const winner = player1.points > player2.points ? player1 : player2;
    const loser = winner.id === player1.id ? player2 : player1;
    const winnerInfos = await this.user.getUserById(winner.id);
    const loserInfos = await this.user.getUserById(loser.id);
    let newRating = null;
    if (!winnerInfos || !loserInfos) return;
    if (room.datas.isRanked)
      newRating = await this.updateUsersRating(winnerInfos, loserInfos);
    await this.prisma.game
      .create({
        data: {
          id: roomId,
          isRanked: room.datas.isRanked,
          winnerId: winner.id,
          loserId: loser.id,
          previousWinnerRating: winnerInfos.ladderPoints,
          previousLoserRating: loserInfos.ladderPoints,
          newWinnerRating: newRating ? newRating.winner : null,
          newLoserRating: newRating ? newRating.loser : null,
          winnerScore: winner.points,
          loserScore: loser.points
        }
      })
      .catch((err) => console.log(err));
  }

  async updateUsersRating(winner: Player, loser: Player) {
    const winnerRating = winner.ladderPoints;
    const loserRating = loser.ladderPoints;
    const newRating = this.calculateNewRating(winnerRating, loserRating);
    await this.updateRating(winner.id, newRating.winner);
    await this.updateRating(loser.id, newRating.loser);
    return newRating;
  }

  // https://en.wikipedia.org/wiki/Elo_rating_system
  calculateNewRating(
    winnerRating: number,
    loserRating: number
  ): { winner: number; loser: number } {
    const D = winnerRating - loserRating;
    const K = 40;
    const pWinner = Math.round((1 / (1 + Math.pow(10, -D / 400))) * 10) / 10;
    const pLoser = Math.round((1 / (1 + Math.pow(10, D / 400))) * 10) / 10;
    const newWinnerRating = Math.round(winnerRating + K * (1 - pWinner));
    const newLoserRating = Math.round(loserRating + K * (0 - pLoser));
    return {
      winner: newWinnerRating,
      loser: newLoserRating
    };
  }

  async updateRating(userId: string, newRating: number): Promise<void> {
    await this.prisma.user
      .update({
        where: { id: userId },
        data: { ladderPoints: newRating }
      })
      .catch((err) => console.log(err));
  }

  handleMovePad(userId: string, datas: GameDatas, dy: number): void {
    if (!datas.score) return;
    const pad = userId === datas.score.player1.id ? datas.pad1 : datas.pad2;
    pad.dy = dy;
  }

  moveBall(ball): void {
    if (!ball) return;
    ball.x += ball.dx * ball.speed;
    ball.y += ball.dy * ball.speed;
  }

  movePad(pad: Pad): void {
    if (!pad || pad.dy === 0) return;
    pad.y += pad.dy * pad.speed;
  }

  checkCollision(pad1: Pad, pad2: Pad, ball: Ball, map: MapInfos): void {
    this.checkCollisionPadToBorder(pad1, map);
    this.checkCollisionPadToBorder(pad2, map);
    this.checkCollisionBallToBorder(ball, map);
    this.checkCollisionBallToPad(ball, pad1, map);
    this.checkCollisionBallToPad(ball, pad2, map);
  }

  checkCollisionPadToBorder(pad: Pad, map: MapInfos): void {
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

  checkCollisionBallToBorder(ball: Ball, map: MapInfos): void {
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

  checkCollisionBallToPad(ball: Ball, pad: Pad, map: MapInfos): void {
    if (
      this.ballIsBetweenPadX(ball, pad) &&
      this.ballIsBetweenPadY(ball, pad)
    ) {
      ball.dx = this.isPlayerOne(ball, map) ? -1 : 1;
      ball.dy = (ball.y - (pad.y + pad.height / 2)) / (map.width / 30);
      ball.speed *= ball.acceleration;
    }
  }

  ballIsBetweenPadY(ball: Ball, pad: Pad): boolean {
    return (
      ball.y >= this.getTopPadPosition(pad) &&
      ball.y <= this.getBottomPadPosition(pad)
    );
  }

  ballIsBetweenPadX(ball: Ball, pad: Pad): boolean {
    return (
      ball.x + ball.radius >= pad.x && ball.x - ball.radius <= pad.x + pad.width
    );
  }

  isPlayerOne(ball: Ball, map: MapInfos): boolean {
    return ball.x > map.height / 2;
  }

  checkGoal(ball: Ball, map: MapInfos, score: Score): void {
    if (ball.x <= 0) {
      score.player2.points += 1;
      this.resetBall(ball, map);
    }
    if (ball.x >= map.width) {
      score.player1.points += 1;
      this.resetBall(ball, map);
    }
  }

  resetBall(ball: Ball, map: MapInfos): void {
    ball.dx = this.isPlayerOne(ball, map) ? -1 : 1;
    ball.dy = Math.random() * 2 - 1;
    ball.x = map.width / 2;
    ball.y = map.height / 2;
    ball.speed = ball.defaultSpeed;
  }

  padIsOnTopBorder(pad: Pad): boolean {
    return this.getTopPadPosition(pad) <= 0;
  }

  padIsOnBottomBorder(pad: Pad, map: MapInfos): boolean {
    return this.getBottomPadPosition(pad) >= map.height;
  }

  getTopPadPosition(pad: Pad): number {
    return pad.y;
  }

  getBottomPadPosition(pad: Pad): number {
    return pad.y + pad.height;
  }

  isUserAlreadyInRoom(userId: string, rooms: Map<string, Room>): boolean {
    const it = rooms[Symbol.iterator]();
    for (const room of it) {
      if (room[1].players.find((player) => player === userId)) return true;
    }
    return false;
  }

  getRoomIdByUserId(userId: string, rooms: Map<string, Room>): string {
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

  getJoinableRoom(rooms: Map<string, Room>): string {
    // test if the game is ranked
    const it = rooms[Symbol.iterator]();
    for (const room of it)
      if (room[1].players.length === 1 && !room[1].isStarted) return room[0];
    return null;
  }

  createRoom(rooms: Map<string, Room>, userId: string): string {
    const room = {
      id: uuidv4(),
      players: [userId]
    };
    rooms.set(room.id, {
      interval: null,
      isStarted: false,
      players: room.players,
      datas: null
    });
    return room.id;
  }

  isGameEnded(score: Score): boolean {
    return (
      score.player1.points === score.scoreLimit ||
      score.player2.points === score.scoreLimit
    );
  }

  getDatasFromRoom(rooms: Map<string, Room>, roomId: string): GameDatas {
    const room = rooms.get(roomId);
    return room.datas;
  }

  initDefaultDatas(room: Room): void {
    const map = {
      height: 525,
      width: 858,
      padOffset: 30
    };
    const padInfos = {
      height: map.height / 7,
      width: map.width / 100,
      speed: map.height / 100
    };
    const ball = {
      x: null,
      y: null,
      radius: map.width / 100,
      defaultSpeed: map.width / 300,
      speed: null,
      acceleration: 1.05,
      dx: null,
      dy: null
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
      scoreLimit: 3,
      player1: { id: room.players[0], points: 0 },
      player2: { id: undefined, points: 0 }
    };
    this.resetBall(ball, map);
    room.datas = {
      map: map,
      padInfos: padInfos,
      ball: ball,
      pad1: pad1,
      pad2: pad2,
      score: score,
      isRanked: true
    };
  }

  initDatasCustomGame(
    room: Room,
    customDatas: CustomDatas,
    userId: string
  ): void {
    if (this.checkCustomDatas(customDatas)) return;
    const roomDatas = room.datas;
    roomDatas.ball.defaultSpeed = customDatas.ballSpeed;
    roomDatas.ball.acceleration = customDatas.ballAcceleration;
    roomDatas.ball.radius = customDatas.ballRadius;
    roomDatas.padInfos.height = customDatas.padHeight;
    roomDatas.padInfos.width = customDatas.padWidth;
    roomDatas.padInfos.speed = customDatas.padSpeed;
    roomDatas.score.scoreLimit = customDatas.maxScore;
    this.setCustomDatasToPad(roomDatas, customDatas);
    roomDatas.isRanked = false;
    roomDatas.score.player1.id = userId;
  }

  setCustomDatasToPad(datas: GameDatas, customDatas: CustomDatas): void {
    datas.pad1.height = customDatas.padHeight;
    datas.pad1.width = customDatas.padWidth;
    datas.pad1.speed = customDatas.padSpeed;
    datas.pad2.height = customDatas.padHeight;
    datas.pad2.width = customDatas.padWidth;
    datas.pad2.speed = customDatas.padSpeed;
  }

  checkCustomDatas(customDatas: CustomDatas): boolean {
    return !(
      this.valueIsBetween(customDatas.ballSpeed, 0.5, 10) &&
      this.valueIsBetween(customDatas.ballAcceleration, 1, 1.5) &&
      this.valueIsBetween(customDatas.ballRadius, 1, 20) &&
      this.valueIsBetween(customDatas.padHeight, 30, 200) &&
      this.valueIsBetween(customDatas.padWidth, 1, 20) &&
      this.valueIsBetween(customDatas.padSpeed, 1, 10) &&
      this.valueIsBetween(customDatas.maxScore, 1, 10)
    );
  }

  valueIsBetween(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }
}
