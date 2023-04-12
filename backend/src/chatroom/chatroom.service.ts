import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { CreateChatroomDto, UpdateChatroomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRoom, ChatRoomUser, Role, RoomType } from '@prisma/client';
import * as argon from 'argon2';

@Injectable()
export class ChatroomService {
  private static DEFAULT_CHATROOM = 'general';

  constructor(private prisma: PrismaService) {}
  async create(userId: number, dto: CreateChatroomDto) {
    const snakecaseName = dto.name.toLowerCase().replaceAll(' ', '_');
    let hash = null;

    if (dto.type === RoomType.PROTECTED && !dto.password) {
      throw new ForbiddenException('Password is required for protected rooms');
    }

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

  async findOne(id: number) {
    return await this.prisma.chatRoom.findUnique({
      where: { id },
      include: { users: true }
    });
  }

  update(id: number, updateChatroomDto: UpdateChatroomDto) {
    return `This action updates a #${id} chatroom`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatroom`;
  }

  async findChatroomUsers(chatroomId: number) {
    return await this.prisma.user.findMany({
      where: {
        chatrooms: {
          some: {
            chatRoom: { id: chatroomId }
          }
        }
      },
      select: {
        id: true,
        nickname: true,
        chatrooms: {
          select: {
            role: true,
            chatRoom: false,
            userId: false
          },
          where: {
            chatRoomId: chatroomId
          }
        }
      }
    });
  }

  async join(
    userId: number,
    chatroomId: number,
    password: string
  ): Promise<ChatRoomUser> {
    const chatroom = await this.findOne(chatroomId);

    if (!chatroom) {
      throw new NotFoundException('Chatroom not found');
    }

    if (chatroom.type === RoomType.PRIVATE) {
      throw new ForbiddenException('Could not join private room');
    }

    if (!(await this.roomPasswordMatches(chatroom, password))) {
      throw new ForbiddenException('Invalid password');
    }
    // Check if user is able to join chatroom
    const chatroomUser = await this.findUserInChatroom(userId, chatroomId);
    if (chatroomUser) {
      throw new ForbiddenException('User already in room');
    }
    // Check if user is banned from channel
    return await this.addUserToChatroom(userId, chatroomId);
  }

  async leave(userId: number, chatroomId: number) {
    // Check if user is able to leave chatroom
    // Add user to chatroom users
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

  async findOrCreateDefaultChatroom() {
    let defaultChatroom = await this.prisma.chatRoom.findUnique({
      where: { name: ChatroomService.DEFAULT_CHATROOM }
    });
    if (!defaultChatroom) {
      defaultChatroom = await this.prisma.chatRoom.create({
        data: {
          name: ChatroomService.DEFAULT_CHATROOM,
          slug: `chatroom_${ChatroomService.DEFAULT_CHATROOM}`
        }
      });
    }
    return defaultChatroom;
  }

  async findJoinableChatroomsForUser(userId: number) {
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
          },
          {
            name: 'general'
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

  async findChatroomsForUser(userId: number) {
    return await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          {
            name: 'general'
          },
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
        slug: true
      }
    });
  }

  private async addUserToChatroom(
    userId: number,
    chatroomId: number,
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

  private async findUserInChatroom(
    userId: number,
    chatroomId: number
  ): Promise<ChatRoomUser> {
    return await this.prisma.chatRoomUser.findFirst({
      where: {
        chatRoomId: chatroomId,
        userId: userId
      }
    });
  }
}
