import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TwoFaService {
  constructor(private prisma: PrismaService) {}
  async createSecret(userId: number) {
    const secret = speakeasy.generateSecret({
      name: 'ft_transcendence'
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

  async verifyTwoFa(twoFactorSecret: string, token: string) {
    return speakeasy.totp.verify({
      secret: twoFactorSecret,
      encoding: 'ascii',
      token: token
    });
  }
}
