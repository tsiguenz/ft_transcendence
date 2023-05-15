import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { CreateChatroomDto, UpdateChatroomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChatroomUserService } from '../chatroom_user/chatroom_user.service';

import { ChatRoom, ChatRoomUser, Role, RoomType } from '@prisma/client';
import * as argon from 'argon2';

@Injectable()
export class ChatroomService {
  constructor(private prisma: PrismaService, private chatroomUser: ChatroomUserService) {}
  async create(userId: string, dto: CreateChatroomDto) {
    const snakecaseName = dto.name.toLowerCase().replaceAll(' ', '_');
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
          slug: `chatroom_${snakecaseName}`,
          users: {
            create: [
              {
                user: { connect: { id: userId } },
                role: Role.OWNER
              }
            ]
          }
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

  remove(id: string) {
    return `This action removes a #${id} chatroom`;
  }

  async join(
    userId: string,
    chatroomId: string,
    password: string
  ): Promise<ChatRoomUser> {
    const chatroom = await this.findOneException(chatroomId);

    if (chatroom.type === RoomType.PRIVATE) {
      throw new ForbiddenException('Could not join private room');
    }

    if (!(await this.roomPasswordMatches(chatroom, password))) {
      throw new ForbiddenException('Invalid password');
    }
    // Check if user is able to join chatroom
    const chatroomUser = await this.chatroomUser.findOne(userId, chatroomId);
    if (chatroomUser) {
      throw new ForbiddenException('User already in room');
    }
    // Check if user is banned from channel
    return await this.chatroomUser.create(userId, chatroomId);
  }

  async leave(userId: string, chatroomId: string) {
    const chatroom = await this.findOneException(chatroomId);

    const chatroomUser = await this.chatroomUser.findOne(userId, chatroomId);
    if (!chatroomUser) {
      throw new ForbiddenException('User not in room');
    }

    return await this.removeUserFromChatroom(userId, chatroomId);
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
        slug: true,
        type: true
      }
    });
  }

  async findChatroomsForUser(userId: string) {
    return await this.prisma.chatRoom.findMany({
      where: {
        users: {
          some: {
            user: { id: userId }
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
  }

  async isUserInChatroom(userId: string, chatroomId: string) {
    return !!(await this.chatroomUser.findOne(userId, chatroomId));
  }

  async isUserChatroomOwner(userId: string, chatroomId: string) {
    const user = await this.chatroomUser.findOne(userId, chatroomId);

    if (!user || user.role !== Role.OWNER) {
      return false;
    }
    return true;
  }

  private async addUserToChatroom(
    userId: string,
    chatroomId: string,
    role: Role = Role.USER
  ): Promise<ChatRoomUser> {
    return await this.prisma.chatRoomUser.create({
      data: {
        userId: userId,
        chatRoomId: chatroomId,
        role: role
      }
    });
  }

  private async removeUserFromChatroom(userId: string, chatroomId: string) {
    return await this.prisma.chatRoomUser.deleteMany({
      where: {
        chatRoomId: chatroomId,
        userId: userId
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
