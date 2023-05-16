import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [GameGateway, GameService, JwtService],
  imports: [PrismaModule],
  exports: [GameGateway]
})
export class GameModule {}
