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

@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway {
  constructor(private gameService: GameService) {}
  datas = {};
  interval = null;
  usersTokens = [];

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    if (
      this.usersTokens.includes(client.handshake.auth.token) ||
      this.usersTokens.length === 2
    )
      return;
    this.logger.log(`Client connected: ${client.id}`);
    this.usersTokens.push(client.handshake.auth.token);
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.usersTokens = this.usersTokens.filter(
      (token) => token !== client.handshake.auth.token
    );
    if (!this.usersTokens.length) {
      clearInterval(this.interval);
      this.interval = null;
      this.datas = {};
      this.logger.log(`Game stopped by ${client.id}`);
    }
  }

  @SubscribeMessage('initGame')
  async handleInitGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() datas: any
  ) {
    if (this.interval) return;
    this.logger.log(`Client init game: ${client.id}`);
    this.datas = datas;
  }

  @SubscribeMessage('startGame')
  async handleStartGame(@ConnectedSocket() client: Socket) {
    if (this.interval) return;
    this.logger.log(`Client start game: ${client.id}`);
    this.interval = setInterval(() => {
      if (!this.usersTokens.length) {
        this.datas = {};
      }
      this.gameService.gameLoop(this.datas);
      this.server.emit('loop', this.datas);
    }, 10);
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
