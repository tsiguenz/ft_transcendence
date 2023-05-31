import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer,
  MessageBody
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { Room } from './interfaces/game.interfaces';

@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway {
  constructor(
    private gameService: GameService,
    private jwt: JwtService,
    private auth: AuthService
  ) {}
  rooms = new Map<string, Room>();

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    if (await this.gameService.setDecodedTokenToClient(client)) return;
    this.logger.log(`Client connected: ${client.id}`);
    if (
      !this.gameService.isUserAlreadyInRoom(client['decoded'].sub, this.rooms)
    )
      return;
    const roomId = this.gameService.getRoomIdByUserId(
      client['decoded'].sub,
      this.rooms
    );
    client.emit('alreadyInGame', roomId);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client['decoded'].sub;
    const room = this.gameService.getRoomIdByUserId(userId, this.rooms);
    if (!room) return;
    client.leave(room);
    this.logger.log(`Client leave room: ${room}`);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('connectToRoom')
  handleConnectToRoom(@ConnectedSocket() client: Socket) {
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
      const room = this.rooms.get(joinableRoom);
      room.players.push(userId);
      this.gameService.initDatas(this.rooms, joinableRoom);
      client.join(joinableRoom);
      this.logger.log(`Client joined room: ${joinableRoom}`);
      this.logger.log(`Start game: ${joinableRoom}`);
      this.server.in(joinableRoom).emit('startGame', room.datas);
      room.interval = setInterval(
        async (joinableRoom) => {
          const res = await this.gameService.gameLoop(this.rooms, joinableRoom);
          const room = this.rooms.get(joinableRoom);
          if (!res) this.server.in(joinableRoom).emit('gameLoop', room.datas);
          else {
            this.logger.log(`Game is over: ${joinableRoom}`);
            this.server.in(joinableRoom).emit('gameOver', { score: res });
          }
        },
        10,
        joinableRoom
      );
    } else {
      const roomId = this.gameService.createRoom(this.rooms, userId);
      client.join(roomId);
      this.logger.log(`Client created room: ${roomId}`);
    }
  }

  @SubscribeMessage('movePad')
  handleMovePad(
    @ConnectedSocket() client: Socket,
    @MessageBody('dy') dy: number
  ) {
    const roomId = this.gameService.getRoomIdByUserId(
      client['decoded'].sub,
      this.rooms
    );
    const data = this.rooms.get(roomId).datas;
    this.gameService.handleMovePad(client['decoded'].sub, data, dy);
  }
}
