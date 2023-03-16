import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { EditProfileDto } from './dto';
import { UnauthorizedException } from '@nestjs/common';

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
    } catch (e) {
      throw new UnauthorizedException(
        'You are not authorized to access this profile'
      );
    }
  }

  async editProfile(dto: EditProfileDto, req: Request) {
    try {
      const userId = req.user['id'];
      await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          nickname: dto.nickname,
          twoFactorEnable: dto.twoFactorEnable,
          // TODO: is good ?
          twoFactorSecret: ''
          // TODO: handle avatar
          // avatar: dto.avatar
        }
      });
      return { message: 'Profile updated' };
    } catch (e) {
      throw new UnauthorizedException(
        'You are not authorized to access this profile'
      );
    }
  }
}
