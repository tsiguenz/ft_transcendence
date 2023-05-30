import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestrictionType, ChatRoomRestriction } from '@prisma/client';
import * as argon from 'argon2';

@Injectable()
export class ChatroomRestrictionService {
  constructor(private prisma: PrismaService) {}

  async findAll(chatroomId: string) {
    return await this.prisma.chatRoomRestriction.findMany({
      where: {
        chatRoom: { id: chatroomId }
      },
      select: {
        userId: true,
        chatRoomId: true,
        type: true
      }
    });
  }

  async findOne(
    userId: string,
    chatroomId: string
  ): Promise<ChatRoomRestriction> {
    return await this.prisma.chatRoomRestriction.findFirst({
      where: {
        chatRoomId: chatroomId,
        userId: userId,
        restrictedUntil: {
          gte: new Date()
        }
      }
    });
  }

  async create(
    userId: string,
    chatroomId: string,
    type: RestrictionType,
    until: Date
  ): Promise<ChatRoomRestriction> {
    return await this.prisma.chatRoomRestriction.create({
      data: {
        userId: userId,
        chatRoomId: chatroomId,
        type: type,
        restrictedUntil: until
      }
    });
  }

  async remove(userId: string, chatroomId: string, type: RestrictionType) {
    return await this.prisma.chatRoomRestriction.deleteMany({
      where: {
        chatRoomId: chatroomId,
        userId: userId,
        type: type
      }
    });
  }

  async isUserRestricted(userId: string, chatroomId: string) {
    return !!(await this.findOne(userId, chatroomId));
  }

  async userHasRestriction(
    userId: string,
    chatroomId: string,
    type: RestrictionType
  ) {
    const restriction = await this.findOne(userId, chatroomId);

    if (!restriction || restriction.type !== type) {
      return false;
    }
    return true;
  }

  async isUserMuted(userId: string, chatroomId: string) {
    return await this.userHasRestriction(
      userId,
      chatroomId,
      RestrictionType.MUTED
    );
  }

  async isUserBanned(userId: string, chatroomId: string) {
    return await this.userHasRestriction(
      userId,
      chatroomId,
      RestrictionType.BANNED
    );
  }

  stringToRestrictionType(type: string): RestrictionType {
    const conversionTable = {
      MUTED: RestrictionType.MUTED,
      BANNED: RestrictionType.BANNED
    };
    return conversionTable[type];
  }
}
