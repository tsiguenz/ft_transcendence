import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class TwoFaService {
  constructor(private prisma: PrismaService) {}
  async createSecret(req: Request) {
    const userId = req.user['id'];
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

  async verifyTwoFa(req: Request, token: string) {
    const userId = req.user['id'];
    const secret = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        twoFactorSecret: true
      }
    });
    return speakeasy.totp.verify({
      secret: secret.twoFactorSecret,
      encoding: 'ascii',
      token: token
    });
  }
}
