import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    });
  }

  // TODO: Change any ?
  async validate(payload: any) {
    // TODO: use select instead of delete
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub
      }
    });
    if (user) delete user.hash;
    return user;
  }
}
