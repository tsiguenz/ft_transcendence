import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { EditProfileDto } from './dto';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { TwoFaService } from '../2fa/2fa.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private users: UsersService,
    private twoFa: TwoFaService
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

  // TODO: refactor this function
  async editProfile(dto: EditProfileDto, req: Request) {
    const userId = req.user['id'];
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        twoFactorSecret: true
      }
    });
    if (dto.twoFactorEnable) {
      if (!dto.twoFactorCode) {
        throw new ForbiddenException('Two factor code required');
      }
      const valid = await this.twoFa.verifyTwoFa(
        user.twoFactorSecret,
        dto.twoFactorCode
      );
      if (!valid) {
        throw new ForbiddenException('Invalid two factor code');
      }
    }
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        nickname: dto.nickname,
        twoFactorEnable: dto.twoFactorEnable
        // TODO: handle avatar
      }
    });
    return { message: 'Profile updated' };
  }
}
