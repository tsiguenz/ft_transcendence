import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpStatus } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { AuthService } from '../auth.service';
import { TwoFaService } from '../../2fa/2fa.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFaService: TwoFaService,
    private readonly prisma: PrismaService
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.APP42_ID,
      clientSecret: process.env.APP42_KEY,
      callbackURL: `http://${process.env.HOST_IP}:3000/api/auth/42`,
      scope: 'public'
    });
  }

  async validate(accessToken42: string) {
    const user42 = await this.authService.getFortyTwoProfile(accessToken42);
    const userDb = await this.prisma.user.findUnique({
      where: {
        fortyTwoId: user42.id
      },
      select: {
        id: true,
        twoFactorEnable: true,
        twoFactorSecret: true
      }
    });
    if (!userDb) {
      const newUser = await this.prisma.user.create({
        data: {
          nickname: `42user-${user42.login}`,
          fortyTwoId: user42.id
        }
      });
      return this.authService.createJwt(newUser.id);
    }
    if (userDb.twoFactorEnable) {
      // TODO: how can I get the two factor code from the request?
      const valid = await this.twoFaService.verifyTwoFa(
        userDb.twoFactorSecret,
        ''
      );
      if (!valid)
        return {
          message: 'Invalid two factor code',
          status: HttpStatus.FORBIDDEN
        };
    }
    return this.authService.createJwt(userDb.id);
  }
}
