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

    try {
      this.validatePayload(parsedPayload);
      const chatroom = await this.chatroom.createWS(userId, parsedPayload);
      client.emit('chatroomCreated', chatroom);
    } catch (e) {
      throw new WsException((e as Error).message);
    }
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
      .to(chatroom.slug)
      .emit(events.CHATROOM_KICKED, { chatroomId: chatroom.id });
    server.in(chatroom.slug).socketsLeave(chatroom.slug);
  }

  async joinChatroom(
    client: Socket,
    payload: { chatroomId: string; password: string }
  ) {
    const userId = client['decoded'].sub;

    if (
      await this.chatroomRestriction.isUserBanned(userId, payload.chatroomId)
    ) {
      throw new WsException('Unauthorized to join room');
    }
    await this.chatroom.join(userId, payload.chatroomId, payload.password);
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
}
