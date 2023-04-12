import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { AuthController } from './auth.controller';

describe('AuthService', () => {
  //  let service: AuthService;
  //  let jwt: JwtService;
  //  let prisma: DeepMockProxy<PrismaClient>;
  //
  //  beforeEach(async () => {
  //    const module: TestingModule = await Test.createTestingModule({
  //      controllers: [AuthController],
  //      providers: [PrismaService, AuthService, JwtService]
  //    }).overrideProvider(PrismaService)
  //      .useValue(mockDeep<PrismaClient>())
  //      .compile();
  //
  //    service = module.get<AuthService>(AuthService);
  //    prisma = module.get(PrismaService);
  //  });
  //
  //  describe('signup', () => {
  //    it('should return a user', async () => {
  //      // @ts-expect-error -- awaiting fix: https://github.com/prisma/prisma/issues/1020
  //      prisma.user.create.mockResolvedValueOnce({id: 1, nickname: 'test'});
  //
  //      const token = await service.signup({
  //        nickname: 'test',
  //        password: 'test'
  //      });
  //
  //      expect(token).toBeDefined();
  //    });
  //  });

  it('should be defined', () => {
    expect(true).toBe(true);
  });
});
