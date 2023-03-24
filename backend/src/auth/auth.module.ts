import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, FortyTwoStrategy } from './strategy';
import { TwoFaService } from '../2fa/2fa.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TwoFaService, FortyTwoStrategy],
  exports: [AuthService]
})
export class AuthModule {}
