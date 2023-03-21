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
}
