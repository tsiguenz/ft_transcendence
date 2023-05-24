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
      this.gameService.initDatas(this.rooms, joinableRoom);
      this.logger.log(`Client joined room: ${joinableRoom}`);
    } else {
      const roomId = this.gameService.createRoom(this.rooms, userId);
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
        const res = this.gameService.gameLoop(this.rooms, roomId);
        const room = this.rooms.get(roomId);
        if (room) client.to(roomId).emit('gameLoop', room.datas);
        else {
          this.logger.log(`Game is over: ${roomId}`);
          client.to(roomId).emit('gameOver', { score: res });
        }
      },
      10,
      roomId
    );
  }

  @SubscribeMessage('pressPadUp')
  async handlePressPadUp(@ConnectedSocket() client: Socket) {
    const roomId = this.gameService.getRoomIdByUserId(
      client['decoded'].sub,
      this.rooms
    );
    const data = this.rooms.get(roomId).datas;
    this.gameService.handlePressPadUp(client['decoded'].sub, data);
  }

  @SubscribeMessage('pressPadDown')
  async handlePressPadDown(@ConnectedSocket() client: Socket) {
    const roomId = this.gameService.getRoomIdByUserId(
      client['decoded'].sub,
      this.rooms
    );
    const data = this.rooms.get(roomId).datas;
    this.gameService.handlePressPadDown(client['decoded'].sub, data);
  }

  @SubscribeMessage('stopPad')
  async handleStopPad(@ConnectedSocket() client: Socket) {
    const roomId = this.gameService.getRoomIdByUserId(
      client['decoded'].sub,
      this.rooms
    );
    const data = this.rooms.get(roomId).datas;
    this.gameService.handleStopPad(client['decoded'].sub, data);
  }
}
