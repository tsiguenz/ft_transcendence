import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          nickname: dto.nickname,
          hash: hash
        }
      });
      return this.createToken(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException('Nickname already exists');
        }
      }
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
    return this.createToken(user);
  }

  async getUser(query: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          nickname: query.nickname
        }
      });
      delete user.hash;
      return user;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async createToken(user: any): Promise<string> {
    const payload = {
      nickname: user.nickname,
      sub: user.id
    };
    return await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET')
    });
  }
}
