import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { ChatroomController } from './chatroom.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from '../auth/strategy';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [ChatroomController],
  providers: [ChatroomService, AccessTokenStrategy],
  exports: [ChatroomService]
})
export class ChatroomModule {}
