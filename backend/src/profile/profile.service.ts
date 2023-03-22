import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EditProfileDto } from './dto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private users: UsersService
  ) {}
  async getProfile(userId: number) {
    try {
      const userProfile = await this.prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          id: true,
          nickname: true,
          avatar: true,
          createdAt: true,
          twoFactorEnable: true
        }
      });
      return userProfile;
    } catch (e) {
      throw new UnauthorizedException(
        'You are not authorized to access this profile'
      );
    }
  }

  async editProfile(dto: EditProfileDto, userId: number) {
    try {
      await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          nickname: dto.nickname,
          twoFactorEnable: dto.twoFactorEnable,
          twoFactorSecret: ''
          // TODO: handle avatar
        }
      });
      // TODO: can return qrcode if 2fa is enabled ?
      return { message: 'Profile updated' };
    } catch (e) {
      throw new UnauthorizedException(
        'You are not authorized to access this profile'
      );
    }
  }
}
