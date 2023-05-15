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
    const userId = await this.statusService.addNewUser(
      client,
      this.connectedUsers
    );
    if (!userId) client.disconnect();
    this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('connectedUsers', this.connectedUsers);
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const sockets = await this.server.fetchSockets();
    const clientJwt = client.handshake.auth.token;
    for (const socket of sockets) {
      if (clientJwt == socket.handshake.auth.token) return;
    }
    const userId = await this.statusService.removeUser(
      client,
      this.connectedUsers
    );
    if (!userId) client.disconnect();
    await this.statusService.setLastConnection(client);
    this.logger.log(`Client disconnected: ${client.id}`);
    this.server.emit('connectedUsers', this.connectedUsers);
  }
}
