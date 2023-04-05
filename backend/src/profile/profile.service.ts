import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EditProfileDto } from './dto';
import { ForbiddenException } from '@nestjs/common';
import { TwoFaService } from '../2fa/2fa.service';
import * as fs from 'fs';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private users: UsersService,
    private twoFa: TwoFaService
  ) {}
  async getProfile(userId: number) {
    const userProfile = await this.users.getUserById(userId);
    return userProfile;
  }

  // TODO: refactor this function
  async editProfile(dto: EditProfileDto, userId: number) {
    const fileExtension = dto.avatarFileType.split('/')[1];
    const avatarPath = `./public/avatars/${userId}.${fileExtension}`;
    fs.writeFileSync(avatarPath, dto.avatarFileBase64, 'base64');
    const user = await this.users.getUserById(userId);
    if (dto.twoFactorEnable && !user.twoFactorEnable) {
      if (!dto.twoFactorCode) {
        throw new ForbiddenException('Two factor code required');
      }
      const valid = await this.twoFa.verifyTwoFa(
        user.twoFactorSecret,
        Number(dto.twoFactorCode)
      );
      if (!valid) throw new ForbiddenException('Invalid two factor code');
    }
    await this.prisma.user
      .update({
        where: {
          id: userId
        },
        data: {
          nickname: dto.nickname,
          twoFactorEnable: dto.twoFactorEnable,
          avatarPath: avatarPath
        }
      })
      .catch(() => {
        throw new ForbiddenException('Nickname already exists');
      });
    return { message: 'Profile updated' };
  }
}
