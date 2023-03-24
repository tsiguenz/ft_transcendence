import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { ChatService } from '../chat/chat.service';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatroomService } from '../chatroom/chatroom.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private auth: AuthService,
    private chat: ChatService,
    private users: UsersService,
    private chatroom: ChatroomService
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('msgToServer')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: { chatroomId: number, message: string }) {
    try {
      console.log(payload);
      const chatroom = await this.chatroom.findOne(payload.chatroomId);
      const user = await this.users.getUserById(client['decoded'].sub);
      
      const message = await this.chat.saveMessage(client['decoded'].sub, payload.chatroomId, payload.message);

      client.to(chatroom.slug).emit('msgToClient', {
        author: user.nickname,
        chatroomId: chatroom.id,
        sentAt: message.createdAt,
        data: payload.message
      });
    } catch (error) {
      this.logger.warn('HandleMessage error');
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() payload: { chatroomId: number }) {
    const chatroom = await this.chatroom.findOne(payload.chatroomId)

    if (!chatroom) { return ; }
    client.join(chatroom.slug);
    this.logger.log(`Client: ${client['decoded'].sub} joined room #${payload.chatroomId}`);
  }

  @SubscribeMessage('getRoomMessages')
  async handleMessageHistory(@ConnectedSocket() client: Socket, @MessageBody() payload: { chatroomId: number, newerThan: Date }) {
    const chatroom = await this.chatroom.findOne(payload.chatroomId)

    if (!chatroom) { return ; }
    const messages = await this.chat.getMessages(chatroom.id, payload.newerThan);
    for (const id in messages) {
      client.emit('msgToClient', {
        author: messages[id].author.nickname,
        chatroomId: chatroom.id,
        sentAt: messages[id].createdAt,
        data: messages[id].content,
      });
    }
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

    const user = await this.users.getUserById(client['decoded'].sub);
    if (!user) {
      client.disconnect();
    }
  }


  // async joinChatroom(client: Socket, chatroomId: number) {

  // }
}
