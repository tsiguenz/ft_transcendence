import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { StatusService } from './status.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [StatusGateway, StatusService, JwtService],
  imports: [PrismaModule],
  exports: [StatusGateway]
})
export class StatusModule {}
