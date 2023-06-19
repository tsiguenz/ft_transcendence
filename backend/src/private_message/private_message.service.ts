import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomType, ChatRoom } from '@prisma/client';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PrivateMessageService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return await this.prisma.chatRoom.findMany({
      where: {
        type: RoomType.ONE_TO_ONE,
        users: {
          some: {
            user: { id: userId }
          }
        }
      },
      include: { users: true }
    });
  }

  async findOne(
    firstUserId: string,
    secondUserId: string
  ) {
    return await this.prisma.chatRoom.findMany({
      where: {
        AND: [
          { type: RoomType.ONE_TO_ONE },
          { users: { some: { userId: firstUserId } } },
          { users: { some: { userId: secondUserId } } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        users: {
          select: {
            user: {
              select: {
                id: true,
                nickname: true
              }
            }
          }
        }
      }
    });
  }

  async findOrCreate(
    firstUserId: string,
    secondUserId: string
  ) {
    const chatroom = await this.findOne(firstUserId, secondUserId);
    if (chatroom.length > 0) {
      return chatroom[0];
    }
    return await this.create(firstUserId, secondUserId);
  }

  async create(firstUserId: string, secondUserId: string) {
    const firstUser = await this.prisma.user.findUnique({
      where: { id: firstUserId }
    });
    const secondUser = await this.prisma.user.findUnique({
      where: { id: secondUserId }
    });

    const roomName = `Private message ${uuid()}`;
    return await this.prisma.chatRoom.create({
      data: {
        name: roomName,
        type: RoomType.ONE_TO_ONE,
        hash: null,
        slug: `chatroom_${firstUserId}_${secondUserId}`,
        users: {
          create: [
            {
              user: { connect: { id: firstUserId } }
            },
            {
              user: { connect: { id: secondUserId } }
            }
          ]
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        users: {
          select: {
            user: {
              select: {
                id: true,
                nickname: true
              }
            }
          }
        }
      }
    });
  }

  async remove(chatroomId: string) {
    return await this.prisma.chatRoom.deleteMany({
      where: {
        id: chatroomId
      }
    });
  }
}
