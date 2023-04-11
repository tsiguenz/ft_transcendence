import { Injectable, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EditProfileDto } from './dto';
import { ForbiddenException } from '@nestjs/common';
import { TwoFaService } from '../2fa/2fa.service';
import { extname } from 'path';
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

  deleteAvatar(avatarPath: string) {
    try {
      fs.unlinkSync(`./public${avatarPath}`);
    } catch (err) {
      console.log(
        "Can't delete avatar because it doesn't exist (no problem for the user)"
      );
    }
  }

  async uploadAvatar(
    userId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    const allowedTypes = ['.png', '.jpg', '.jpeg'];
    const fileSizeMb = file.size / 1024 ** 2;
    const extension = extname(file.originalname);
    const oldAvatar = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        avatarPath: true
      }
    });
    if (!file) throw new ForbiddenException('File required');
    if (!allowedTypes.includes(extension))
      throw new ForbiddenException('Invalid file type');
    if (fileSizeMb > 2)
      throw new ForbiddenException('File size limit exceeded (2MB)');
    file.path = file.path.replace('public', '');
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        avatarPath: file.path
      }
    });
    if (oldAvatar.avatarPath !== '/avatars/default.jpeg') {
      this.deleteAvatar(oldAvatar.avatarPath);
    }
    return { message: 'Avatar updated' };
  }
}
