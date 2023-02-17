import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ConfigService, AuthService, JwtService]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should return a user', async () => {
      const token = await service.signup({
        nickname: 'test',
        password: 'test'
      });
      console.log(token.access_token);
      //console.log(jwt.decode(token.access_token));
      expect(token).toBeDefined();
    });
  });
});
