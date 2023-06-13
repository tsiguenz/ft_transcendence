import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { TwoFaService } from '../2fa/2fa.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [
    GameGateway,
    GameService,
    JwtService,
    AuthService,
    TwoFaService,
    UsersService
  ],
  imports: [PrismaModule],
  exports: [GameGateway]
})
export class GameModule {}
