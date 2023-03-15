import { Injectable } from '@nestjs/common';
import { speakeasy } from 'speakeasy';
import { qrcode } from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TwoFaService {
  constructor(private prisma: PrismaService) {}
  async generate2faSecret(nickname: string) {
    const secret = speakeasy.generateSecret({
      name: 'ft_transcendence'
    });
    await this.prisma.user.update({
      where: { nickname: nickname },
      data: { twoFactorSecret: secret.ascii }
    });
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return qrcode.toDataURL(otpAuthUrl);
  }

  async verifyTwoFa(token: string, secret: string) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'ascii',
      token: token
    });
  }
}
