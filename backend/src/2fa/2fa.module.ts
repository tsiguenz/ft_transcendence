import { Module } from '@nestjs/common';
import { TwoFaController } from './2fa.controller';
import { TwoFaService } from './2fa.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TwoFaController],
  providers: [TwoFaService]
})
export class TwoFaModule {}
