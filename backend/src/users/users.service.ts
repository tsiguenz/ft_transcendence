import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
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

  getPayloadFromReq(req: Request) {
    const token = req.headers.authorization.substr(7);
    const payload = this.jwt.decode(token);
    return payload;
  }

  //  async getProfile(nickname: string, req: Request) {
  //    try {
  //      const payload = this.getPayloadFromReq(req);
  //      const getNicknameFromJwt = payload['nickname'];
  //      if (nickname == getNicknameFromJwt) {
  //        const userProfile = await this.prisma.user.findUnique({
  //          where: {
  //            nickname: nickname
  //          }
  //        });
  //        // TODO: create dto or interface for user profile
  //        delete userProfile.hash;
  //        delete userProfile.twoFactorSecret;
  //        return userProfile;
  //      }
  //      return { message: 'You are not authorized to access this profile' };
  //    } catch (e) {
  //      return { message: 'User does not exist' };
  //    }
  //  }

  // TODO: remove after test 2fa
  async turnOn2fa(req: Request) {
    try {
      const payload = this.getPayloadFromReq(req);
      const nickname = payload['nickname'];
      await this.prisma.user.update({
        where: { nickname: nickname },
        data: { twoFactorEnable: true }
      });
      return { message: '2fa turned on' };
    } catch (e) {
      console.log(e);
      return { message: 'User not found' };
    }
  }

  // TODO: remove after test 2fa
  async turnOff2fa(req: Request) {
    try {
      const payload = this.getPayloadFromReq(req);
      const nickname = payload['nickname'];
      await this.prisma.user.update({
        where: { nickname: nickname },
        data: { twoFactorEnable: false }
      });
      return { message: '2fa turned off' };
    } catch (e) {
      console.log(e);
      return { message: 'User not found' };
    }
  }
}
