import { Injectable, ForbiddenException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

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

  async verifyTwoFaRoute(id: string, code: number) {
    const newEntry = await this.prisma.twoFactorId
      .findUnique({
        where: {
          uuid: id
        },
        select: {
          user: {
            select: {
              id: true,
              nickname: true,
              twoFactorEnable: true,
              twoFactorSecret: true
            }
          }
        }
      })
      .catch(() => {
        throw new ForbiddenException('Invalid user');
      });
    if (!newEntry) throw new ForbiddenException('Invalid user');
    if (!newEntry.user.twoFactorEnable)
      throw new ForbiddenException('2fa not enabled');
    return {
      userId: newEntry.user.id,
      nickname: newEntry.user.nickname,
      ret: this.verifyTwoFa(newEntry.user.twoFactorSecret, code)
    };
  }

  verifyTwoFa(twoFactorSecret: string, token: number) {
    return speakeasy.totp.verify({
      secret: twoFactorSecret,
      encoding: 'ascii',
      token: token
    });
  }

  async generateTwoFaId(userId: number) {
    const newEntry = await this.prisma.twoFactorId.upsert({
      where: {
        userId: userId
      },
      update: { uuid: uuidv4() },
      create: {
        user: {
          connect: {
            id: userId
          }
        }
      },
      select: {
        uuid: true
      }
    });
    return newEntry.uuid;
  }

  async deleteTwoFaId(uuid: string) {
    await this.prisma.twoFactorId.delete({
      where: {
        uuid: uuid
      }
    });
  }
}
