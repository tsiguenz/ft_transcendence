import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { StatusService } from './status.service';

@WebSocketGateway({ namespace: 'status', cors: { origin: '*' } })
export class StatusGateway {
  constructor(private statusService: StatusService) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('StatusGateway');
  connectedUsers: string[] = [];

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    await this.statusService.addNewUser(client, this.connectedUsers);
    this.server.emit('connectedUsers', this.connectedUsers);
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.statusService.removeUser(client, this.connectedUsers);
    this.server.emit('connectedUsers', this.connectedUsers);
  }
}
