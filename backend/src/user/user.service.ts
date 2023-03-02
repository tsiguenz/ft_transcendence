import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUser(nickname: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          nickname: nickname
        }
      });
      delete user.hash;
      return user;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async getAllUsers() {
    console.log('get all users');
    const users = await this.prisma.user.findMany();
    users.forEach((user) => delete user.hash);
    return users;
  }

  async turnOn2fa(nickname: string) {
    try {
      await this.prisma.user.update({
        where: { nickname: nickname },
        data: { twoFactorEnable: true }
      });
      console.log('2fa turned on');
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async turnOff2fa(nickname: string) {
    try {
      await this.prisma.user.update({
        where: { nickname: nickname },
        data: { twoFactorEnable: false }
      });
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }
}
