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
  constructor(private statusService: GameService) {}

  HEIGHT = 600;
  WIDTH = 900;

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('pressPadUp')
  async handlePressPadUp() {
    this.server.emit('movePadUp');
  }

  @SubscribeMessage('pressPadDown')
  async handlePressPadDown() {
    this.server.emit('movePadDown');
  }

  @SubscribeMessage('releasePadUp')
  async handleReleasePadUp() {
    this.server.emit('releasePadUp');
  }

  @SubscribeMessage('releasePadDown')
  async handleReleasePadDown() {
    this.server.emit('releasePadDown');
  }
}
