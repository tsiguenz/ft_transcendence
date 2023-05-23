import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException
} from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { ChatService } from '../chat/chat.service';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatroomService } from '../chatroom/chatroom.service';
import { ChatroomUserService } from '../chatroom_user/chatroom_user.service';
import { ChatroomRestrictionService } from '../chatroom_restriction/chatroom_restriction.service';
import { UsersService } from '../users/users.service';
import * as events from './socketioEvents';

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private auth: AuthService,
    private chat: ChatService,
    private users: UsersService,
    private chatroom: ChatroomService,
    private chatroomUser: ChatroomUserService
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage(events.MESSAGE_TO_SERVER)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatroomId: string; message: string }
  ) {
    try {
      const chatroom = await this.chatroom.findOne(payload.chatroomId);
      const user = await this.users.getUserById(client['decoded'].sub);

      const message = await this.chat.saveMessage(
        client['decoded'].sub,
        payload.chatroomId,
        payload.message
      );

      this.server.to(chatroom.slug).emit(events.MESSAGE_TO_CLIENT, {
        authorId: user.id,
        authorNickname: user.nickname,
        chatroomId: chatroom.id,
        sentAt: message.createdAt,
        data: payload.message
      });
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.JOIN_ROOM)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatroomId: string }
  ) {
    // TODO: refactor these checks
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (!chatroom) {
      return;
    }

    if (
      !(await this.chatroomUser.isUserInChatroom(
        client['decoded'].sub,
        chatroom.id
      ))
    ) {
      return;
    }

    try {
      client.join(chatroom.slug);
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.LEAVE_ROOM)
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatroomId: string }
  ) {
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (!chatroom) {
      return;
    }

    try {
      await this.chatroom.leave(client['decoded'].sub, chatroom.id);
      client.leave(chatroom.slug);
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.DELETE_ROOM)
  async handleDeletion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatroomId: string }
  ) {
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (!chatroom) {
      return;
    }

    if (
      !(await this.chatroomUser.isUserOwner(client['decoded'].sub, chatroom.id))
    ) {
      throw new WsException('Unauthorized to delete room');
    }

    try {
      this.chatroom.remove(chatroom.id);
      this.server
        .to(chatroom.slug)
        .emit(events.KICKED_FROM_ROOM, { chatroomId: chatroom.id });
      this.server.in(chatroom.slug).socketsLeave(chatroom.slug);
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.GET_MESSAGES)
  async handleMessageHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatroomId: string; newerThan: Date }
  ) {
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (!chatroom) {
      return;
    }

    if (
      !(await this.chatroomUser.isUserInChatroom(
        client['decoded'].sub,
        chatroom.id
      ))
    ) {
      return;
    }
    const messages = await this.chat.getMessages(
      chatroom.id,
      payload.newerThan
    );
    for (const id in messages) {
      client.emit(events.MESSAGE_TO_CLIENT, {
        authorId: messages[id].author.id,
        authorNickname: messages[id].author.nickname,
        chatroomId: chatroom.id,
        sentAt: messages[id].createdAt,
        data: messages[id].content
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
    if (!(client.handshake.auth && client.handshake.auth.token)) {
      client.disconnect();
      return;
    }

    try {
      client['decoded'] = await this.auth.verifyJwt(
        client.handshake.auth.token
      );
    } catch (error) {
      let message = 'Unexpected error';
      if (error instanceof Error) {
        message = error.message;
      }
      client.disconnect();
      return;
    }

    const user = await this.users.getUserById(client['decoded'].sub);
    if (!user) {
      client.disconnect();
    }
  }
}
