import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Payload } from '../interfaces/jwt.interface';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt_refresh'
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET
    });
  }

  async validate(req: Request, payload: Payload) {
    console.log('refresh token strategy');
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    return { payload, refreshToken };
  }
}
