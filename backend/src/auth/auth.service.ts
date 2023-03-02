import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async signup(dto: AuthDto) {
    // Check if user exist to avoid auto increment id
    const user = await this.prisma.user.findUnique({
      where: {
        nickname: dto.nickname
      }
    });
    if (user) {
      throw new ForbiddenException('Nickname already exists');
    }
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          nickname: dto.nickname,
          hash: hash
        }
      });
      return this.createJwt(user.id, user.nickname);
    } catch (e) {
      throw e;
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        nickname: dto.nickname
      }
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const valid = await argon.verify(user.hash, dto.password);
    if (!valid) {
      throw new ForbiddenException('Invalid password');
    }
    return this.createJwt(user.id, user.nickname);
  }

  async createJwt(
    userId: number,
    nickname: string
  ): Promise<{ access_token: string }> {
    const payload = {
      nickname: nickname,
      sub: userId
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET')
    });
    return { access_token: token };
  }

  async generate2faSecret(nickname: string) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      nickname,
      'ft_transcendence',
      secret
    );
    await this.prisma.user.update({
      where: { nickname: nickname },
      data: { twoFactorSecret: secret }
    });
    return { secret, otpauthUrl };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async is2faCodeValid(Code: string, Secret: string) {
    return authenticator.verify({ token: Code, secret: Secret });
  }
}
