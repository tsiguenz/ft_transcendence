import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomType } from '@prisma/client';
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

  async findOne(firstUserId: string, secondUserId: string) {
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

  async findOrCreate(firstUserId: string, secondUserId: string) {
    const chatroom = await this.findOne(firstUserId, secondUserId);
    if (chatroom.length > 0) {
      await this.makeRoomVisible(chatroom[0].id, firstUserId);
      return chatroom[0];
    }
    return await this.create(firstUserId, secondUserId);
  }

  async create(firstUserId: string, secondUserId: string) {
    const roomName = `Private message ${uuid()}`;
    return await this.prisma.chatRoom.create({
      data: {
        name: roomName,
        type: RoomType.ONE_TO_ONE,
        hash: null,
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

  private async makeRoomVisible(chatroomId: string, userId: string) {
    await this.prisma.chatRoomUser.updateMany({
      where: {
        userId,
        chatRoomId: chatroomId
      },
      data: {
        hidden: false
      }
    });
  }
}
