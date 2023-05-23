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
  interval;
  playersInGame = 0;

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.playersInGame++;
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.datas = {};
    this.logger.log(`Client disconnected: ${client.id}`);
    this.playersInGame--;
    if (this.playersInGame === 0) clearInterval(this.interval);
  }

  @SubscribeMessage('initGame')
  async handleInitGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() datas: any
  ) {
    this.logger.log(`Client init game: ${client.id}`);
    this.datas = datas;
  }

  @SubscribeMessage('startGame')
  async handleStartGame(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client start game: ${client.id}`);
    this.interval = setInterval(() => {
      if (!this.playersInGame) {
        this.datas = {};
      }
      this.gameService.gameLoop(this.datas);
      this.server.emit('loop', this.datas);
    }, 20);
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
