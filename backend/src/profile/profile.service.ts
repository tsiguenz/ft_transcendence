import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private users: UsersService
  ) {}
  async getProfile(req: Request) {
    try {
      const payload = this.users.getPayloadFromReq(req);
      const nickname = payload['nickname'];
      const userProfile = await this.prisma.user.findUnique({
        where: {
          nickname: nickname
        }
      });
      // TODO: create dto or interface for user profile
      delete userProfile.hash;
      delete userProfile.twoFactorSecret;
      return userProfile;
      return { message: 'You are not authorized to access this profile' };
    } catch (e) {
      return { message: 'User does not exist' };
    }
  }
}
