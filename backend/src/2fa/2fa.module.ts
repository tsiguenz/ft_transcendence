import { Module } from '@nestjs/common';
import { TwoFaController } from './2fa.controller';
import { TwoFaService } from './2fa.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [TwoFaController],
  providers: [TwoFaService, AuthService, JwtService, UsersService]
})
export class TwoFaModule {}
