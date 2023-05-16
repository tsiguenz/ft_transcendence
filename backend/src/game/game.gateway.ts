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
  async handlePressPadUp(
    @ConnectedSocket() client: Socket,
    @MessageBody('player') player: string
  ) {
    console.log('pressPadUp', player);
    this.server.emit('movePadUp', player);
  }

  @SubscribeMessage('pressPadDown')
  async handlePressPadDown(
    @ConnectedSocket() client: Socket,
    @MessageBody('player') player: string
  ) {
    console.log('pressPadDown', player);
    this.server.emit('movePadDown', player);
  }

  @SubscribeMessage('releasePadUp')
  async handleReleasePadUp(
    @ConnectedSocket() client: Socket,
    @MessageBody('player') player: string
  ) {
    console.log('releasePadUp', player);
  }

  @SubscribeMessage('releasePadDown')
  async handleReleasePadDown(
    @ConnectedSocket() client: Socket,
    @MessageBody('player') player: string
  ) {
    console.log('releasePadDown', player);
  }
}
