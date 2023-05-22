import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { ChatroomController } from './chatroom.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatroomUserModule } from '../chatroom_user/chatroom_user.module';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from '../auth/strategy';

@Module({
  imports: [ChatroomUserModule, PrismaModule, JwtModule.register({})],
  controllers: [ChatroomController],
  providers: [ChatroomService, AccessTokenStrategy],
  exports: [ChatroomService]
})
export class ChatroomModule {}
