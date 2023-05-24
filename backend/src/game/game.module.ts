import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { TwoFaService } from '../2fa/2fa.service';

@Module({
  providers: [GameGateway, GameService, JwtService, AuthService, TwoFaService],
  imports: [PrismaModule],
  exports: [GameGateway]
})
export class GameModule {}
