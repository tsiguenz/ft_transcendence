//import { PassportStrategy } from '@nestjs/passport';
//import { Injectable } from '@nestjs/common';
//import { Strategy } from 'passport-oauth2';
//
//@Injectable()
//export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
//  constructor() {
//    super({
//      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
//      tokenURL: 'https://api.intra.42.fr/oauth/token',
//      clientID:
//        '',
//      clientSecret:
//        '',
//      callbackURL: 'http://localhost:3000/auth/42/callback',
//      scope: 'public'
//    });
//  }
//
//  async validate(payload: any) {
//    console.log('strategy');
//    return { profile: payload };
//  }
//}
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET')
    });
  }

  // TODO: Change any ?
  async validate(payload: any) {
    console.log('strategy used yoooooooooo');
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub
      }
    });
    if (user) delete user.hash;
    return user;
  }
}
