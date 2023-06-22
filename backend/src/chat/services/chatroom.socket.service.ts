import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChatService } from '../../chat/chat.service';
import { Socket, Server } from 'socket.io';
import { ChatroomService } from '../../chatroom/chatroom.service';
import { ChatroomUserService } from '../../chatroom_user/chatroom_user.service';
import { ChatroomRestrictionService } from '../../chatroom_restriction/chatroom_restriction.service';
import { RoomType } from '@prisma/client';
import * as events from '../socketioEvents';
import { CreateChatroomPayload } from '../interfaces/createChatroom.interface';

@Injectable()
export class ChatroomSocketService {
  constructor(
    private chat: ChatService,
    private chatroom: ChatroomService,
    private chatroomUser: ChatroomUserService,
    private chatroomRestriction: ChatroomRestrictionService
  ) {}

  async createChatroom(client: Socket, payload: any) {
    const userId = client['decoded'].sub;
    const parsedPayload = this.parsePayload(payload);

    this.validatePayload(parsedPayload);
    return await this.chatroom.create(userId, parsedPayload);
  }

  async deleteChatroom(
    client: Socket,
    server: Server,
    payload: { chatroomId: string }
  ) {
    const userId = client['decoded'].sub;
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (!(await this.chatroomUser.isUserOwner(userId, payload.chatroomId))) {
      throw new WsException('Unauthorized to delete room');
    }
    this.chatroom.remove(chatroom.id);

    server
      .to(chatroom.id)
      .emit(events.CHATROOM_KICKED, { chatroomId: chatroom.id });
    server.in(chatroom.id).socketsLeave(chatroom.id);
  }

  async joinChatroom(
    client: Socket,
    server: Server,
    payload: { chatroomId: string; password: string }
  ) {
    const userId = client['decoded'].sub;
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    await this.chatroom.join(userId, payload.chatroomId, payload.password);

    const formattedUser = await this.getFormattedChatroomUser(
      userId,
      chatroom.id
    );

    client.emit(events.CHATROOM_NEW, {
      chatroom: chatroom
    });
    server.to(chatroom.id).emit(events.CHATROOM_USER_CONNECT, {
      chatroomId: chatroom.id,
      chatroomUser: formattedUser
    });
  }

  async leaveChatroom(
    client: Socket,
    server: Server,
    payload: { chatroomId: string }
  ) {
    const userId = client['decoded'].sub;
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (chatroom.type !== RoomType.ONE_TO_ONE) {
      await this.chatroom.leave(userId, payload.chatroomId);
    }

    client.leave(chatroom.id);
    server.to(chatroom.id).emit(events.CHATROOM_USER_DISCONNECT, {
      chatroomId: chatroom.id,
      userId
    });
  }

  async invite(
    client: Socket,
    userSocket: any,
    server: Server,
    payload: { chatroomId: string; userId: string }
  ) {
    const userId = client['decoded'].sub;
    const chatroom = await this.chatroom.findOne(payload.chatroomId);

    if (
      !(await this.chatroomUser.canUserAdministrate(userId, payload.chatroomId))
    ) {
      throw new WsException('Unauthorized to invite users');
    }

    if (
      await this.chatroomRestriction.isUserBanned(
        payload.userId,
        payload.chatroomId
      )
    ) {
      throw new WsException(`Cannot invite user to room`);
    }

    if (
      chatroom.type !== RoomType.PRIVATE &&
      chatroom.type !== RoomType.PROTECTED
    ) {
      throw new WsException(`Cannot invite to ${chatroom.type} room`);
    }

    await this.chatroom.addUser(payload.userId, payload.chatroomId);

    const formattedUser = await this.getFormattedChatroomUser(
      payload.userId,
      chatroom.id
    );
    if (userSocket) {
      userSocket.emit(events.CHATROOM_NEW, {
        chatroom: chatroom
      });
    }
    server.to(chatroom.id).emit(events.CHATROOM_USER_CONNECT, {
      chatroomId: chatroom.id,
      chatroomUser: formattedUser
    });
  }

  // ---- [ Private ] ----

  private validatePayload(payload: CreateChatroomPayload) {
    if (!payload.name) {
      throw new WsException('Missing name');
    }

    if (!payload.type) {
      throw new WsException('Invalid type');
    }

    if (payload.type === RoomType.PROTECTED && !payload.password) {
      throw new WsException('Missing password');
    }

    return payload;
  }

  private parsePayload(payload: any) {
    return {
      name: payload.name,
      type: payload.type as RoomType,
      password: payload.password
    };
  }

  private async getFormattedChatroomUser(userId: string, chatroomId: string) {
    const chatroomUser = await this.chatroomUser.findOneWithRestrictions(
      userId,
      chatroomId
    );

    const formattedUser = {
      id: chatroomUser.id,
      nickname: chatroomUser.nickname,
      role: chatroomUser.chatrooms[0].role,
      restrictions: chatroomUser.restrictions
    };

    return formattedUser;
  }
}
