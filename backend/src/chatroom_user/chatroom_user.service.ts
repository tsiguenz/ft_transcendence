import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRoom, ChatRoomUser, Role, RoomType } from '@prisma/client';
import * as argon from 'argon2';

@Injectable()
export class ChatroomUserService {
  constructor(private prisma: PrismaService) {}

  async findAll(chatroomId: string) {
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
        },
        restrictions: {
          select: {
            type: true,
            restrictedUntil: true
          },
          where: {
            chatRoomId: chatroomId,
            restrictedUntil: {
              gte: new Date()
            }
          }
        }
      }
    });
  }

  async findOne(userId: string, chatroomId: string): Promise<ChatRoomUser> {
    return await this.prisma.chatRoomUser.findFirst({
      where: {
        chatRoomId: chatroomId,
        userId: userId
      }
    });
  }

  async findOneWithRestrictions(userId: string, chatroomId: string) {
    return await this.prisma.user.findFirst({
      where: { id: userId },
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
        },
        restrictions: {
          select: {
            type: true,
            restrictedUntil: true
          },
          where: {
            chatRoomId: chatroomId,
            restrictedUntil: {
              gte: new Date()
            }
          }
        }
      }
    });
  }

  async create(
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

  async remove(userId: string, chatroomId: string) {
    return await this.prisma.chatRoomUser.deleteMany({
      where: {
        chatRoomId: chatroomId,
        userId: userId
      }
    });
  }

  async setUserRole(userId: string, chatroomId: string, role: Role) {
    return await this.prisma.chatRoomUser.update({
      where: {
        chatrooms_users_pkey: {
          userId: userId,
          chatRoomId: chatroomId
        }
      },
      data: {
        role: role
      }
    });
  }

  async isUserInChatroom(userId: string, chatroomId: string) {
    return !!(await this.findOne(userId, chatroomId));
  }

  async userHasRole(userId: string, chatroomId: string, role: Role) {
    const user = await this.findOne(userId, chatroomId);

    if (!user || user.role !== role) {
      return false;
    }
    return true;
  }

  async isUserOwner(userId: string, chatroomId: string) {
    return await this.userHasRole(userId, chatroomId, Role.OWNER);
  }

  async isUserAdmin(userId: string, chatroomId: string) {
    return await this.userHasRole(userId, chatroomId, Role.ADMIN);
  }

  async canUserAdministrate(userId: string, chatroomId: string) {
    return (
      (await this.isUserAdmin(userId, chatroomId)) ||
      (await this.isUserOwner(userId, chatroomId))
    );
  }
}
