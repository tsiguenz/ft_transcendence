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

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.datas = {};
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('initGame')
  async handleInitGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameDatas: any
  ) {
    this.logger.log(`Client init game: ${client.id}`);
    this.datas = gameDatas;
  }

  @SubscribeMessage('startGame')
  async handleStartGame(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client start game: ${client.id}`);
    setInterval(() => {
      this.gameService.gameLoop(this.datas);
      this.server.emit('loop', this.datas);
    }, 10);
  }

  @SubscribeMessage('pressPadUp')
  async handlePressPadUp() {
    this.gameService.handlePressPadUp(this.server, this.datas);
  }

  @SubscribeMessage('pressPadDown')
  async handlePressPadDown() {
    this.gameService.handlePressPadDown(this.server, this.datas);
  }

  @SubscribeMessage('releasePadUp')
  async handleReleasePadUp() {
    this.gameService.handleReleasePadUp(this.server, this.datas);
  }

  @SubscribeMessage('releasePadDown')
  async handleReleasePadDown() {
    this.gameService.handleReleasePadDown(this.server, this.datas);
  }
}
