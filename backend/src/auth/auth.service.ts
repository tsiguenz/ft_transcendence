import {
  ForbiddenException,
  UnauthorizedException,
  Injectable,
  Res,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { TwoFaService } from '../2fa/2fa.service';
import * as axios from 'axios';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private twoFa: TwoFaService
  ) {}

  // TODO: sanitize input
  async signup(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        nickname: dto.nickname
      }
    });
    if (user) throw new ForbiddenException('Nickname already exists');
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          nickname: dto.nickname,
          hash: hash
        }
      });
      return this.createJwt(user.id);
    } catch (e) {
      throw e;
    }
  }

  // TODO: sanitize input
  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        nickname: dto.nickname
      }
    });
    if (!user || user.fortyTwoId)
      throw new ForbiddenException('Invalid password');
    const valid = await argon.verify(user.hash, dto.password);
    if (!valid) {
      throw new ForbiddenException('Invalid password');
    }
    if (user.twoFactorEnable) {
      if (!dto.twoFactorCode)
        throw new ForbiddenException('Two factor code required');
      const valid = await this.twoFa.verifyTwoFa(
        user.twoFactorSecret,
        dto.twoFactorCode
      );
      if (!valid) throw new ForbiddenException('Invalid two factor code');
    }
    return this.createJwt(user.id);
  }

  async createJwt(userId: number) {
    const payload = {
      sub: userId
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_SECRET
    });
    return { access_token: token };
  }
  async verifyJwt(token: string) {
    const decoded = await this.jwt.verify(token, {
      secret: process.env.JWT_SECRET
    });
    return decoded;
  }

  async getFortyTwoProfile(accessToken42: string) {
    const response = await axios.default
      .get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken42}`
        }
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid 42 token');
      });
    return response.data;
  }

  async fortyTwoAuth(@Res() res: Response, user: any) {
    if (user.twoFactorEnable) {
      // TODO: how can I get the two factor code from the request?
      const valid = await this.twoFa.verifyTwoFa(user.twoFactorSecret, '');
      if (!valid) {
        res.status(HttpStatus.FORBIDDEN);
        //        res.send('Invalid two factor code');
        return res.redirect(`http://${process.env.HOST_IP}:8080/signin`);
      }
    }
    // TODO: move in service
    const jwt = await this.createJwt(user['id']);
    res.cookie('jwt', jwt.access_token);
    return res.redirect(`http://${process.env.HOST_IP}:8080/home`);
  }
}
