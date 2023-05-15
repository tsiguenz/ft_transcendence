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
        }
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
    })
  }

  async isUserInChatroom(userId: string, chatroomId: string) {
    return !!(await this.findUserInChatroom(userId, chatroomId));
  }

  async userHasRole(userId: string, chatroomId: string, role: Role) {
    const user = await this.findUserInChatroom(userId, chatroomId);

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

  async findUserInChatroom(
    userId: string,
    chatroomId: string
  ): Promise<ChatRoomUser> {
    return await this.prisma.chatRoomUser.findFirst({
      where: {
        chatRoomId: chatroomId,
        userId: userId
      }
    });
  }
}
