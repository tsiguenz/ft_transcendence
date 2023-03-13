import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('UserService', () => {
  let service: UserService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
          UserService,
          PrismaService,
        ],
    }).overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getAllUsers returns users', () => {
    const testUsers = [
      {
        "id": 1,
        "nickname": "lucien",
        "ladderPoints": 0,
        "avatar": null,
        "twofa": false,
        "OAuth": false,
        "createdAt": "2023-03-03T18:29:00.857Z"
      }
    ];

    // @ts-expect-error -- awaiting fix: https://github.com/prisma/prisma/issues/1020
    prisma.user.findMany.mockResolvedValueOnce(testUsers);

    expect(service.getAllUsers()).resolves.toBe(testUsers);
  });
});
