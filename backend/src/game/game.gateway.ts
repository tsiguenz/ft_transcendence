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
import { Room, CustomDatas } from './interfaces/game.interfaces';

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
    if (!roomId) return;
    client.emit('alreadyInGame', roomId);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client['decoded'].sub;
    const roomId = this.gameService.getRoomIdByUserId(userId, this.rooms);
    if (roomId) {
      if (!this.rooms.get(roomId).isStarted) this.rooms.delete(roomId);
      this.logger.log(`Client leave room: ${roomId}`);
      client.leave(roomId);
    }
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
      room.datas.score.player2.id = userId;
      client.join(joinableRoom);
      this.logger.log(`Client joined room: ${joinableRoom}`);
      room.isStarted = true;
      this.logger.log(`Start game: ${joinableRoom}`);
      this.server
        .in(joinableRoom)
        .emit('startGame', { gameId: joinableRoom, datas: room.datas });
      room.interval = setInterval(
        // use arrow function to keep the context of this
        // https://developer.mozilla.org/en-US/docs/Web/API/setInterval
        //(roomId: string) => this.gameLoop(roomId),
        (roomId: string, that: any) => this.gameService.gameLoop(roomId, that),
        10,
        joinableRoom,
        this
      );
    } else {
      const roomId = this.gameService.createRoom(this.rooms, userId);
      this.gameService.initDefaultDatas(this.rooms.get(roomId));
      client.join(roomId);
      this.logger.log(`Client created ranked room: ${roomId}`);
    }
  }

  @SubscribeMessage('createCustomRoom')
  handleCreateCustomRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CustomDatas
  ) {
    const userId = client['decoded'].sub;
    if (
      this.gameService.isUserAlreadyInRoom(client['decoded'].sub, this.rooms)
    ) {
      return;
    }
    const roomId = this.gameService.createRoom(this.rooms, userId);
    const room = this.rooms.get(roomId);
    this.gameService.initDefaultDatas(room);
    this.gameService.initDatasCustomGame(room, data, userId);
    client.join(roomId);
    client.emit('customRoomCreated', { gameId: roomId });
    this.logger.log(`Client created room for custom game: ${roomId}`);
  }

  @SubscribeMessage('joinCustomRoom')
  handleJoinCustomRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) {
    const userId = client['decoded'].sub;
    if (
      this.gameService.isUserAlreadyInRoom(client['decoded'].sub, this.rooms)
    ) {
      return;
    }
    const room = this.rooms.get(roomId);
    if (!room || room.isStarted || room.datas.isRanked) {
      this.logger.log(`Room not found: ${roomId}`);
      client.emit('roomNotFound');
      return;
    }
    room.players.push(userId);
    room.datas.score.player2.id = userId;
    client.join(roomId);
    this.logger.log(`Client joined room for custom game: ${roomId}`);
    room.isStarted = true;
    this.server
      .in(roomId)
      .emit('startGame', { gameId: roomId, datas: room.datas });
    room.interval = setInterval(
      // use arrow function to keep the context of this
      // https://developer.mozilla.org/en-US/docs/Web/API/setInterval
      (roomId: string, that: any) => this.gameService.gameLoop(roomId, that),
      10,
      roomId,
      this
    );
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
