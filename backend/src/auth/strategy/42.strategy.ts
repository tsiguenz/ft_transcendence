import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.APP42_ID,
      clientSecret: process.env.APP42_KEY,
      callbackURL:
        'http://' + process.env.HOST_IP + ':3000/api/auth/42/callback',
      scope: 'public'
    });
  }

  async validate(code: string) {
    return { code: code };
  }
}
