import { Injectable, UploadedFile, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EditProfileDto } from './dto';
import { ForbiddenException } from '@nestjs/common';
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
    const userProfile = await this.users.getUserById(userId);
    return userProfile;
  }

  // TODO: refactor this function
  async editProfile(dto: EditProfileDto, userId: number) {
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
          twoFactorEnable: dto.twoFactorEnable
        }
      })
      .catch(() => {
        throw new ForbiddenException('Nickname already exists');
      });
    return { message: 'Profile updated' };
  }

  async uploadAvatar(@Req() req: Request, @UploadedFile() file) {
    //    const userId = req.user['id'];
    //    const user = await this.users.getUserById(userId);
    //    const avatarPath = `avatars/${user.nickname}.png`;
    //    await this.prisma.user.update({
    //      where: {
    //        id: userId
    //      },
    //      data: {
    //        avatarPath: avatarPath
    //      }
    //    });
    //    return { message: 'Avatar updated' };
  }
}
