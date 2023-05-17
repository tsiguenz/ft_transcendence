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
  map = {};
  ball = {};
  pad1 = {};
  pad2 = {};

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.map = {};
    this.ball = {};
    this.pad1 = {};
    this.pad2 = {};
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('initGame')
  async handleInitGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameDatas: any
  ) {
    this.logger.log(`Client init game: ${client.id}`);
    this.map = gameDatas.map;
    this.ball = gameDatas.ball;
    this.pad1 = gameDatas.pad1;
    this.pad2 = gameDatas.pad2;
  }
  //
  //  @SubscribeMessage('startGame')
  //  async handleStartGame(@ConnectedSocket() client: Socket) {
  //    this.logger.log(`Client start game: ${client.id}`);
  //    setInterval(() => {
  //      this.gameService.gameLoop();
  //    }, 100);
  //  }
  //
  //  @SubscribeMessage('pressPadUp')
  //  async handlePressPadUp() {
  //    this.gameService.handlePressPadUp(this.server);
  //  }
  //
  //  @SubscribeMessage('pressPadDown')
  //  async handlePressPadDown() {
  //    this.gameService.handlePressPadDown(this.server);
  //  }
  //
  //  @SubscribeMessage('releasePadUp')
  //  async handleReleasePadUp() {
  //    this.gameService.handleReleasePadUp(this.server);
  //  }
  //
  //  @SubscribeMessage('releasePadDown')
  //  async handleReleasePadDown() {
  //    this.gameService.handleReleasePadDown(this.server);
  //  }
}
