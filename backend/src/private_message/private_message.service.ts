import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomType, ChatRoom} from '@prisma/client';

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
  ): Promise<Array<ChatRoom>> {
      return await this.prisma.chatRoom.findMany({
      where: {
        type: RoomType.ONE_TO_ONE,
        users: {
          some: {
            AND: [
              {
                user: { id: secondUserId },
              },
              {
                user: { id: firstUserId },
              }
            ]
          }
        }
      },
      include: { users: true }
    });
  }

  async create(
    firstUserId: string,
    secondUserId: string,
  ): Promise<ChatRoom> {
    const firstUser =  await this.prisma.user.findUnique({ where: { id: firstUserId }, });
    const secondUser =  await this.prisma.user.findUnique({ where: { id: secondUserId }, });

    const roomName = `(${firstUser.nickname} - ${secondUser.nickname}) Private message`;
    return await this.prisma.chatRoom.create({
      data: {
          name: roomName,
          type: RoomType.ONE_TO_ONE,
          hash: null,
          slug: `chatroom_${firstUserId}_${secondUserId}`,
          users: {
            create: [
              {
                user: { connect: { id: firstUserId } },
              },
              {
                user: { connect: { id: secondUserId } },
              },
            ]
          }
        }
    });
  }

  async remove(chatroomId: string) {
    return await this.prisma.chatRoom.deleteMany({
      where: {
        id: chatroomId,
      }
    });
  }
}
