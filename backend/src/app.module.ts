import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { ChatroomModule } from './chatroom/chatroom.module';
import { StatusModule } from './status/status.module';
import { TwoFaService } from './2fa/2fa.service';
import { TwoFaModule } from './2fa/2fa.module';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ChatroomUserModule } from './chatroom_user/chatroom_user.module';
import { ChatroomRestrictionService } from './chatroom_restriction/chatroom_restriction.service';


// TODO: remember when we said global is bad? Well, it's bad here too.
@Module({
  imports: [
    AuthModule,
    ChatroomModule,
    UsersModule,
    PrismaModule,
    UsersModule,
    TwoFaModule,
    StatusModule,
    ChatroomUserModule,
    ServeStaticModule.forRoot({
      rootPath: '/app/public',
      serveRoot: '/'
    })
  ],
  providers: [ChatGateway, ChatService, TwoFaService, UsersService, JwtService, ChatroomRestrictionService]
})
export class AppModule {}
