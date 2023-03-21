import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TwoFaService } from '../2fa/2fa.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private twoFa: TwoFaService
  ) {}

  async signup(dto: AuthDto) {
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
    if (user.twoFactorEnable) {
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
  async verifyJwt(token: string) {
    const decoded = await this.jwt.verify(token, {
      secret: this.config.get('JWT_SECRET')
    });
    return decoded;
  }
}
