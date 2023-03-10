import {
 SubscribeMessage,
 WebSocketGateway,
 OnGatewayInit,
 WebSocketServer,
 OnGatewayConnection,
 OnGatewayDisconnect,
} from '@nestjs/websockets';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
 constructor(private prisma: PrismaService, private auth: AuthService) {}

 @WebSocketServer() server: Server;
 private logger: Logger = new Logger('ChatGateway');

 @SubscribeMessage('msgToServer')
 async handleMessage(client: Socket, payload: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: client['decoded'].sub }
  });
  await this.prisma.message.create({
    data: {
      authorId: user.id,
      content: payload,
    }
  });
  client.broadcast.emit('msgToClient', { data: `From [${user.nickname}]: ${payload}` });
 }

 @SubscribeMessage('testChannel')
 handleTest(client: Socket, payload: string) {
  this.server.emit('msgToClient', { data: "From server: " + payload });
 }

 afterInit(server: Server) {
  this.logger.log('Init');
 }

 handleDisconnect(client: Socket) {
  this.logger.log(`Client disconnected: ${client.id}`);
 }

 async handleConnection(client: Socket, ...args: any[]) {
  this.logger.log(`Client connected: ${client.id}`);
  if (client.handshake.auth && client.handshake.auth.token) {
    try {
      client['decoded'] = await this.auth.verifyJwt(client.handshake.auth.token)
      this.logger.log(`DECODED: ${JSON.stringify(client['decoded'])}`);
    } catch (error) {
      let message = "Unexpected error";
      if (error instanceof Error) { message = error.message; }
      this.logger.log(`AUTHENTICATION ERROR [${message}]`);
      client.disconnect();
    }
  } else {
    client.disconnect();
  }
  const user = await this.prisma.user.findUnique({ where: { id: client['decoded'].sub } });
  if (!user) { client.disconnect(); }
 }
}
