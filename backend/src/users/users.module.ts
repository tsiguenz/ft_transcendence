import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ChatroomService } from '../chatroom/chatroom.service';
import { JwtModule } from '@nestjs/jwt';
import { ChatroomUserModule } from '../chatroom_user/chatroom_user.module';
import { TwoFaService } from '../2fa/2fa.service';

@Module({
  imports: [JwtModule.register({}), ChatroomUserModule],
  controllers: [UsersController],
  providers: [UsersService, TwoFaService, ChatroomService],
  exports: [UsersService]
})
export class UsersModule {}
