import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Payload } from '../interfaces/jwt.interface';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET
    });
  }

  async validate(payload: Payload) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub
      }
    });
    if (user) delete user.hash;
    return user;
  }
}
