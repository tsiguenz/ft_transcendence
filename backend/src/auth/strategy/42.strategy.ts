import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.APP42_ID,
      clientSecret: process.env.APP42_KEY,
      callbackURL: `http://${process.env.HOST_IP}:3000/api/auth/42/callback`,
      scope: 'public'
    });
  }

  async validate(accessToken42: string) {
    const user42 = await this.authService.getFortyTwoProfile(accessToken42);
    const userDb = await this.prisma.user.findUnique({
      where: {
        fortyTwoId: user42.id
      }
    });
    if (userDb) return userDb;
    const newUser = await this.prisma.user.create({
      data: {
        nickname: `42user-${user42.login}`,
        fortyTwoId: user42.id
      }
    });
    return newUser;
  }
}
