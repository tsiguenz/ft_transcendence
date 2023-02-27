import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async	signup(dto: AuthDto) {
    const	user = await this.prisma.user.findUnique({
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
      return this.createToken(user.id, user.nickname);
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
    return this.createToken(user.id, user.nickname);
  }

  async createToken(
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

  async getUser(nickname: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          nickname: nickname
        }
      });
      delete user.hash;
      return user;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany();
    users.forEach((user) => delete user.hash);
    return users;
  }
}
