import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway {
  constructor(
    private gameService: GameService,
    private jwt: JwtService,
    private auth: AuthService
  ) {}
  datas = {};
  // useless
  // useless
  usersTokens = [];
  rooms = new Map();

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    if (await this.gameService.setDecodedTokenToClient(client)) return;
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client['decoded'].sub;
    const room = this.gameService.getRoomIdByUserId(userId, this.rooms);
    if (!room) return;
    client.leave(room);
    this.logger.log(`Client leave room: ${room}`);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('connectToRoom')
  async handleConnectToRoom(@ConnectedSocket() client: Socket) {
    const userId = client['decoded'].sub;
    if (
      this.gameService.isUserAlreadyInRoom(client['decoded'].sub, this.rooms)
    ) {
      const roomId = this.gameService.getRoomIdByUserId(userId, this.rooms);
      client.join(roomId);
      this.logger.log(`Reconnect user ${userId} to room ${roomId}`);
      return;
    }
    const joinableRoom = this.gameService.getJoinableRoom(this.rooms);
    if (joinableRoom) {
      this.rooms.get(joinableRoom).players.push(userId);
      client.join(joinableRoom);
      this.logger.log(`Client joined room: ${joinableRoom}`);
    } else {
      const roomId = this.gameService.createRoom(this.rooms, userId);
      this.gameService.initDatas(this.rooms, roomId);
      client.join(roomId);
      this.logger.log(`Client created room: ${roomId}`);
    }
  }

  @SubscribeMessage('startGame')
  async handleStartGame(@ConnectedSocket() client: Socket) {
    const roomId = this.gameService.getRoomIdByUserId(
      client['decoded'].sub,
      this.rooms
    );
    const room = this.rooms.get(roomId);
    if (room.interval || room.players.length !== 2) return;
    this.logger.log(`Client start game: ${client.id}`);
    room.interval = setInterval(
      (roomId) => {
        this.gameService.gameLoop(this.rooms, roomId);
        client.to(roomId).emit('gameLoop', this.rooms.get(roomId).datas);
      },
      10,
      roomId
    );
  }

  @SubscribeMessage('pressPadUp')
  async handlePressPadUp(@ConnectedSocket() client: Socket) {
    this.gameService.handlePressPadUp(client, this.datas, this.usersTokens);
  }

  @SubscribeMessage('pressPadDown')
  async handlePressPadDown(@ConnectedSocket() client: Socket) {
    this.gameService.handlePressPadDown(client, this.datas, this.usersTokens);
  }

  @SubscribeMessage('releasePadUp')
  async handleReleasePadUp(@ConnectedSocket() client: Socket) {
    this.gameService.handleReleasePadUp(client, this.datas, this.usersTokens);
  }

  @SubscribeMessage('releasePadDown')
  async handleReleasePadDown(@ConnectedSocket() client: Socket) {
    this.gameService.handleReleasePadDown(client, this.datas, this.usersTokens);
  }
}
