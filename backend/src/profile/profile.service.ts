import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
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

  // TODO: refactor this function
  async editProfile(dto: EditProfileDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        twoFactorEnable: true,
        twoFactorSecret: true
      }
    });
    // check when user enable two factor
    if (dto.twoFactorEnable && !user.twoFactorEnable) {
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
    await this.prisma.user
      .update({
        where: {
          id: userId
        },
        data: {
          nickname: dto.nickname,
          twoFactorEnable: dto.twoFactorEnable
          // TODO: handle avatar
        }
      })
      .catch(() => {
        throw new ForbiddenException('Nickname already exists');
      });
    return { message: 'Profile updated' };
  }
}
