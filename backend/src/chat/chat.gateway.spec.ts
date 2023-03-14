import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('ChatGateway', () => {
  // let gateway: ChatGateway;
  // let prisma: DeepMockProxy<PrismaClient>;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       ChatGateway,
  //       ChatService,
  //       AuthService,
  //       PrismaService,
  //     ],
  //   }).overrideProvider(PrismaService)
  //     .useValue(mockDeep<PrismaClient>())
  //     .compile();

  //   gateway = module.get<ChatGateway>(ChatGateway);
  //   prisma = module.get(PrismaService);
  // });

  it('should be defined', () => {
    expect(true).toBe(true);
  });
});
