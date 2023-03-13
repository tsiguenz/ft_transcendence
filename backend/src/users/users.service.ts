import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
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
    const users = await this.prisma.user.findMany();
    users.forEach((user) => delete user.hash);
    return users;
  }

  // JWT utils

  getPayloadFromReq(req: Request) {
    const token = this.getTokenFromReq(req);
    return this.getPayloadFromToken(token);
  }

  getPayloadFromToken(token: string) {
    return this.jwt.decode(token);
  }

  // This method do not check if token is valid
  getTokenFromReq(req: Request) {
    const rawToken = req.headers.authorization;
    const isValidToken = rawToken && rawToken.startsWith('Bearer ');
    if (!isValidToken) {
      throw new Error('You are not authorized to access this profile');
    }
    return rawToken.substr(7);
  }

  // TODO: remove after test 2fa
  async turnOn2fa(req: Request) {
    try {
      const token = this.getTokenFromReq(req);
      const payload = this.getPayloadFromToken(token);
      const nickname = payload['nickname'];
      // TODO: set 2fa secret if not set
      await this.prisma.user.update({
        where: { nickname: nickname },
        data: { twoFactorEnable: true }
      });
      return { message: '2fa turned on' };
    } catch (e) {
      return { message: 'You are not authorized to access this profile' };
    }
  }

  // TODO: remove after test 2fa
  async turnOff2fa(req: Request) {
    try {
      const token = this.getTokenFromReq(req);
      const payload = this.getPayloadFromToken(token);
      const nickname = payload['nickname'];
      await this.prisma.user.update({
        where: { nickname: nickname },
        data: { twoFactorEnable: false }
      });
      return { message: '2fa turned off' };
    } catch (e) {
      console.log(e);
      return { message: 'You are not authorized to access this profile' };
    }
  }
}
