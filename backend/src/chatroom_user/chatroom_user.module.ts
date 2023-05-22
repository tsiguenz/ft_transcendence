import { Module } from '@nestjs/common';
import { ChatroomUserService } from './chatroom_user.service';
import { ChatroomUserController } from './chatroom_user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from '../auth/strategy';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [ChatroomUserController],
  providers: [ChatroomUserService, AccessTokenStrategy],
  exports: [ChatroomUserService]
})
export class ChatroomUserModule {}
