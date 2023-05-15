import {
  ForbiddenException,
  UnauthorizedException,
  Injectable
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { TwoFaService } from '../2fa/2fa.service';
import * as axios from 'axios';
import { Signin42Dto } from './dto/signin42.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private twoFa: TwoFaService
  ) {}

  async signup(dto: AuthDto) {
    let user = await this.prisma.user.findUnique({
      where: {
        nickname: dto.nickname
      }
    });
    if (user) throw new ForbiddenException('Nickname already exists');
    const hash = await argon.hash(dto.password);
    user = await this.prisma.user.create({
      data: {
        nickname: dto.nickname,
        hash: hash
      }
    });
    return await this.createAndUpdateTokens(user.id);
  }

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
    if (user.twoFactorEnable)
      return {
        message: 'Two factor code required',
        id: await this.twoFa.generateTwoFaId(user.id)
      };
    return await this.createAndUpdateTokens(user.id);
  }

  async logout(userId: string) {
    await this.updateRefreshToken(userId, '');
  }

  async createTokens(userId: string) {
    const payload = {
      sub: userId
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_ACCESS_SECRET
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET
    });
    return { access_token: token, refresh_token: refreshToken };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon.verify(
      user.refreshToken,
      refreshToken
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.createTokens(user.id);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async createAndUpdateTokens(userId: string) {
    const tokens = await this.createTokens(userId);
    await this.updateRefreshToken(userId, tokens.refresh_token);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = refreshToken ? await argon.hash(refreshToken) : null;
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        refreshToken: hash
      }
    });
  }

  async verifyJwt(token: string) {
    const decoded = await this.jwt.verify(token, {
      secret: process.env.JWT_ACCESS_SECRET
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

  async get42Token(authorizationCode: string) {
    const response = await axios.default
      .post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.APP42_ID,
        client_secret: process.env.APP42_KEY,
        code: authorizationCode,
        redirect_uri: `http://${process.env.HOST_IP}:8080/42/callback`
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid 42 authorization code');
      });
    return response.data.access_token;
  }

  async signin42(dto: Signin42Dto) {
    if (!dto.access_token42)
      dto.access_token42 = await this.get42Token(dto.authorization);
    const user42 = await this.getFortyTwoProfile(dto.access_token42);
    let user = await this.prisma.user.findUnique({
      where: {
        fortyTwoId: user42.id
      }
    });
    if (!user) {
      if (!dto.nickname)
        return {
          message: 'Nickname required',
          access_token42: dto.access_token42
        };
      user = await this.prisma.user
        .create({
          data: {
            nickname: dto.nickname,
            fortyTwoId: user42.id
          }
        })
        .catch(() => {
          throw new UnauthorizedException('User already exist');
        });
    }
    if (user.twoFactorEnable)
      return {
        message: 'Two factor code required',
        id: await this.twoFa.generateTwoFaId(user.id)
      };
    const tokens = await this.createAndUpdateTokens(user.id);
    return {
      nickname: user.nickname,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    };
  }
}
