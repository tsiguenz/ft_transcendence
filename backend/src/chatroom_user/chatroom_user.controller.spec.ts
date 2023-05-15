import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomUserController } from './chatroom_user.controller';

describe('ChatroomUserController', () => {
  let controller: ChatroomUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatroomUserController],
    }).compile();

    controller = module.get<ChatroomUserController>(ChatroomUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
