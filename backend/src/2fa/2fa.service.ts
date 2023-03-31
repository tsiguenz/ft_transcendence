import { Injectable, ForbiddenException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TwoFaService {
  constructor(private prisma: PrismaService) {}
  async createSecret(userId: number) {
    const secret = speakeasy.generateSecret({
      name: process.env.APP_NAME
    });
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        twoFactorSecret: secret.ascii
      }
    });
    return secret;
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return { qrcode: await qrcode.toDataURL(otpAuthUrl) };
  }

  async verifyTwoFaRoute(userId: number, code: number) {
    const user = await this.prisma.user
      .findUnique({
        where: {
          id: userId
        },
        select: {
          nickname: true,
          twoFactorEnable: true,
          twoFactorSecret: true
        }
      })
      .catch(() => {
        throw new ForbiddenException('Invalid user');
      });
    if (!user) throw new ForbiddenException('Invalid user');
    if (!user.twoFactorEnable) throw new ForbiddenException('2fa not enabled');
    return {
      nickname: user.nickname,
      ret: this.verifyTwoFa(user.twoFactorSecret, code)
    };
  }

  verifyTwoFa(twoFactorSecret: string, token: number) {
    return speakeasy.totp.verify({
      secret: twoFactorSecret,
      encoding: 'ascii',
      token: token
    });
  }
}
