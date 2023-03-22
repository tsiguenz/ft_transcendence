import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  async getUser(nickname: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          nickname: nickname
        },
        select: {
          // TODO: id is necessary?
          id: true,
          nickname: true,
          ladderPoints: true,
          avatar: true,
          createdAt: true
        }
      });
      return user;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async getUserById(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          // TODO: id is necessary?
          id: true,
          nickname: true,
          ladderPoints: true,
          avatar: true,
          createdAt: true
        }
      });
      return user;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        // TODO: id is necessary?
        id: true,
        nickname: true,
        ladderPoints: true,
        avatar: true,
        createdAt: true
      }
    });
    return users;
  }
}
