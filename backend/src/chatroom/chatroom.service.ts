import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatroomDto, UpdateChatroomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRoomUser, Role } from '@prisma/client';

@Injectable()
export class ChatroomService {
  private static DEFAULT_CHATROOM = 'general';

  constructor(private prisma: PrismaService) {}
  async create(userId: number, dto: CreateChatroomDto) {
    const snakecaseName = dto.name.toLowerCase().replaceAll(' ', '_');

    try {
      const chatroom = await this.prisma.chatRoom.create({
        data: {
          name: dto.name,
          type: dto.type,
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

  async join(userId: number, chatroomId: number): Promise<ChatRoomUser> {
    const chatroom = await this.findOne(chatroomId);
    if (!chatroom) {
      throw new Error('Chatroom not found');
    }
    // Check if user is able to join chatroom
    const chatroomUser = await this.findUserInChatroom(userId, chatroomId);
    if (chatroomUser) {
      throw new Error('User already in room');
    }
    // Check if user is banned from channel
    return await this.addUserToChatroom(userId, chatroomId);
  }

  async leave(userId: number, chatroomId: number) {
    // Check if user is able to leave chatroom
    // Add user to chatroom users
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
