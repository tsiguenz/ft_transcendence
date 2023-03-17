import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { ChatroomModule } from './chatroom/chatroom.module';
import { TwoFaService } from './2fa/2fa.service';
import { TwoFaModule } from './2fa/2fa.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule,
    ChatroomModule,
    UsersModule,
    PrismaModule,
    UsersModule,
    ProfileModule,
    TwoFaModule
  ],
  controllers: [],
  providers: [ChatGateway, ChatService, TwoFaService]
})
export class AppModule {}
