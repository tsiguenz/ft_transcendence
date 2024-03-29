import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { CreateChatroomDto, UpdateChatroomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChatroomUserService } from '../chatroom_user/chatroom_user.service';
import { ChatroomRestrictionService } from '../chatroom_restriction/chatroom_restriction.service';

import { ChatRoom, ChatRoomUser, Role, RoomType } from '@prisma/client';
import * as argon from 'argon2';

@Injectable()
export class ChatroomService {
  constructor(
    private prisma: PrismaService,
    private chatroomUser: ChatroomUserService,
    private chatroomRestriction: ChatroomRestrictionService
  ) {}
  async create(userId: string, dto: CreateChatroomDto) {
    let hash = null;

    if (dto.type === RoomType.PROTECTED && dto.password) {
      hash = await argon.hash(dto.password);
    }

    try {
      const chatroom = await this.prisma.chatRoom.create({
        data: {
          name: dto.name,
          type: dto.type,
          hash: hash,
          users: {
            create: [
              {
                user: { connect: { id: userId } },
                role: Role.OWNER
              }
            ]
          }
        },
        select: {
          id: true,
          name: true,
          type: true
        }
      });
      return chatroom;
    } catch (e) {
      throw new NotFoundException('Could not create chatroom');
    }
  }

  async findAll() {
    return await this.prisma.chatRoom.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.chatRoom.findUnique({
      where: { id },
      include: { users: true }
    });
  }

  async update(id: string, dto: UpdateChatroomDto) {
    let roomType: RoomType = RoomType.PUBLIC;
    let hash = null;

    if (dto.password !== '') {
      roomType = RoomType.PROTECTED;
      hash = await argon.hash(dto.password);
    }

    return await this.prisma.chatRoom.update({
      where: { id: id },
      data: {
        hash: hash,
        type: roomType
      }
    });
  }

  async remove(id: string) {
    return await this.prisma.chatRoom.delete({
      where: { id: id }
    });
  }

  async addUser(userId: string, chatroomId: string) {
    const chatroomUser = await this.chatroomUser.findOne(userId, chatroomId);
    if (chatroomUser) {
      throw new ForbiddenException('User already in room');
    }

    return await this.chatroomUser.create(userId, chatroomId);
  }

  async join(
    userId: string,
    chatroomId: string,
    password: string
  ): Promise<ChatRoomUser> {
    const chatroom = await this.findOneException(chatroomId);

    if (
      chatroom.type === RoomType.PRIVATE ||
      chatroom.type === RoomType.ONE_TO_ONE
    ) {
      throw new ForbiddenException('Could not join private room');
    }

    if (await this.chatroomRestriction.isUserBanned(userId, chatroomId)) {
      throw new ForbiddenException('Unauthorized to join room');
    }

    if (!(await this.roomPasswordMatches(chatroom, password))) {
      throw new ForbiddenException('Invalid password');
    }

    return await this.addUser(userId, chatroomId);
  }

  async leave(userId: string, chatroomId: string) {
    const chatroom = await this.findOneException(chatroomId);

    const chatroomUser = await this.chatroomUser.findOne(userId, chatroomId);
    if (!chatroomUser) {
      throw new ForbiddenException('User not in room');
    }

    if (chatroom.type == RoomType.ONE_TO_ONE) {
      return await this.prisma.chatRoomUser.updateMany({
        where: {
          userId,
          chatRoomId: chatroomId
        },
        data: {
          hidden: true
        }
      });
    }
    return await this.chatroomUser.remove(userId, chatroomId);
  }

  async roomPasswordMatches(
    chatroom: ChatRoom,
    password: string
  ): Promise<boolean> {
    if (!chatroom.hash) {
      return true;
    }
    if (!password) {
      return false;
    }
    return await argon.verify(chatroom.hash, password);
  }

  async findJoinableChatroomsForUser(userId: string) {
    return await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          {
            type: RoomType.PUBLIC
          },
          {
            type: RoomType.PROTECTED
          }
        ],
        NOT: [
          {
            users: {
              some: {
                user: { id: userId }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        type: true
      }
    });
  }

  private async findOneException(chatroomId: string) {
    const chatroom = await this.findOne(chatroomId);

    if (!chatroom) {
      throw new NotFoundException('Chatroom not found');
    }

    return chatroom;
  }
}
