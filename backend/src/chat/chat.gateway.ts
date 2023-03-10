import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { ChatService } from '../chat/chat.service';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private auth: AuthService, private chat: ChatService) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('msgToServer')
  async handleMessage(client: Socket, payload: string) {
    try {
      await this.chat.saveMessage(client['decoded'].sub, payload);
    } catch (error) {
      this.logger.warn('HandleMessage error');
    }

    const user = await this.chat.getUser(client['decoded'].sub);
    client.broadcast.emit('msgToClient', {
      author: user.nickname,
      data: payload
    });
  }

  @SubscribeMessage('testChannel')
  handleTest(client: Socket, payload: string) {
    this.server.emit('msgToClient', { author: 'SERVER', data: payload });
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // TODO: Refactor this huge function
  // Should it do all of this?
  // Couldn't we extract parts of it in more appropriates services/modules?
  // Is this connection handler really secure?
  // We should decouple  Prisma and the ChatGetway
  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    if (client.handshake.auth && client.handshake.auth.token) {
      try {
        client['decoded'] = await this.auth.verifyJwt(
          client.handshake.auth.token
        );
      } catch (error) {
        let message = 'Unexpected error';
        if (error instanceof Error) {
          message = error.message;
        }
        this.logger.log(`AUTHENTICATION ERROR [${message}]`);
        client.disconnect();
        return;
      }
    } else {
      client.disconnect();
      return;
    }
    const user = await this.chat.getUser(client['decoded'].sub);
    if (!user) {
      client.disconnect();
    } else {
      const messages = await this.chat.getMessages();
      for (const id in messages) {
        client.emit('msgToClient', {
          author: messages[id].author.nickname,
          data: messages[id].content
        });
      }
    }
  }
}
