import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { StatusModule } from './status/status.module';
import { TwoFaService } from './2fa/2fa.service';
import { TwoFaModule } from './2fa/2fa.module';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';

// TODO: remember when we said global is bad? Well, it's bad here too.
@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    UsersModule,
    ProfileModule,
    TwoFaModule,
    StatusModule,
    ServeStaticModule.forRoot({
      rootPath: '/app/public',
      serveRoot: '/'
    })
  ],
  controllers: [],
  providers: [ChatGateway, ChatService, TwoFaService, UsersService, JwtService]
})
export class AppModule {}
