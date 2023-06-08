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
import { PrivateMessageService } from '../private_message/private_message.service';
import { UsersService } from '../users/users.service';
import { RestrictionType, ChatRoom, RoomType } from '@prisma/client';
import { ChatroomSocketService } from './services/chatroom.socket.service';
import { CreateChatroomPayload } from '../chat/interfaces/createChatroom.interface';
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
    private chatroomUser: ChatroomUserService,
    private chatroomRestriction: ChatroomRestrictionService,
    private privateMessage: PrivateMessageService,
    private chatroomSocketService: ChatroomSocketService
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

      if (
        await this.chatroomRestriction.isUserRestricted(user.id, chatroom.id)
      ) {
        return;
      }

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

  @SubscribeMessage(events.CHATROOM_CONNECT)
  async handleConnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatroomId: string }
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

    try {
      client.join(chatroom.slug);
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.CHATROOM_JOIN)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatroomId: string; password: string }
  ) {
    try {
      await this.chatroomSocketService.joinChatroom(
        client,
        this.server,
        payload
      );
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  // @SubscribeMessage(events.CHATROOM_JOINABLE_ROOMS)
  // async handleGetRooms(@ConnectedSocket() client: Socket) {
  //   try {
  //     const rooms = await this.chatroom.findJoinableChatroomsForUser(
  //       client['decoded'].sub
  //     );

  //     client.emit(events.CHATROOM_JOINABLE_ROOMS, rooms);
  //   } catch (e) {
  //     throw new WsException((e as Error).message);
  //   }
  // }

  @SubscribeMessage(events.CHATROOM_CREATE)
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      name: string;
      roomType: string;
      password: string;
      userIds: Array<string>;
    }
  ) {
    let chatroom = undefined;

    try {
      if (payload.roomType !== RoomType.ONE_TO_ONE) {
        return await this.chatroomSocketService.createChatroom(client, payload);
      }

      if (payload.roomType === RoomType.ONE_TO_ONE) {
        chatroom = await this.privateMessage.create(
          payload.userIds[0],
          payload.userIds[1]
        );
      }
      // client.join(chatroom.slug);
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.CHATROOM_LEAVE)
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

  @SubscribeMessage(events.CHATROOM_DELETE)
  async handleDeletion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatroomId: string }
  ) {
    try {
      await this.chatroomSocketService.deleteChatroom(
        client,
        this.server,
        payload
      );
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.CHATROOM_KICK)
  async handleKick(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string; chatroomId: string }
  ) {
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (!(await this.canRestrictUser(payload.userId, chatroom, client))) {
      throw new WsException('Unauthorized to kick user');
    }

    try {
      await this.kickUser(payload.userId, chatroom);
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.CHATROOM_RESTRICT_USER)
  async handleRestrict(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      userId: string;
      chatroomId: string;
      restrictionType: string;
      time: number;
    }
  ) {
    if (1 > payload.time || payload.time > 100000000) {
      throw new WsException('Restriction time invalid');
    }

    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (!(await this.canRestrictUser(payload.userId, chatroom, client))) {
      throw new WsException('Unauthorized to restrict user');
    }

    const date = new Date();
    const until = new Date(date.getTime() + payload.time * 1000 * 60);
    const restrictionType = this.chatroomRestriction.stringToRestrictionType(
      payload.restrictionType
    );

    if (!restrictionType) {
      throw new WsException('Unknown restriction type');
    }

    try {
      this.chatroomRestriction.create(
        payload.userId,
        chatroom.id,
        restrictionType,
        until
      );

      if (restrictionType == RestrictionType.MUTED) {
        return;
      }
      await this.kickUser(payload.userId, chatroom);
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.CHATROOM_UNRESTRICT_USER)
  async handleUnrestrict(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      userId: string;
      chatroomId: string;
      restrictionType: string;
    }
  ) {
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (!(await this.canRestrictUser(payload.userId, chatroom, client))) {
      throw new WsException('Unauthorized to unrestrict user');
    }

    const restrictionType = this.chatroomRestriction.stringToRestrictionType(
      payload.restrictionType
    );

    if (!restrictionType) {
      throw new WsException('Unknown restriction type');
    }

    try {
      this.chatroomRestriction.remove(
        payload.userId,
        chatroom.id,
        restrictionType
      );
    } catch (e) {
      throw new WsException((e as Error).message);
    }
  }

  @SubscribeMessage(events.CHATROOM_GET_MESSAGES)
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

  async getUserSocket(userId: string) {
    const sockets = await this.server.fetchSockets();
    for (const socket of sockets) {
      if (socket['decoded'].sub == userId) {
        return socket;
      }
    }
    return null;
  }

  private async kickUser(userId: string, chatroom: ChatRoom) {
    const socket = await this.getUserSocket(userId);
    if (!socket) {
      return;
    }

    socket.emit(events.CHATROOM_KICKED, { chatroomId: chatroom.id });
    socket.leave(chatroom.slug);
    this.chatroomUser.remove(userId, chatroom.id);
  }

  private async canRestrictUser(
    userId: string,
    chatroom: ChatRoom,
    target: Socket
  ) {
    if (!chatroom) {
      return false;
    }

    if (!(await this.users.getUserById(userId))) {
      return false;
    }

    if (
      (await this.chatroomUser.isUserOwner(userId, chatroom.id)) ||
      !(await this.chatroomUser.canUserAdministrate(
        target['decoded'].sub,
        chatroom.id
      ))
    ) {
      return false;
    }
    return true;
  }
}
