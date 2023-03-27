import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { TwoFaService } from '../2fa/2fa.service';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  controllers: [ProfileController],
  providers: [ProfileService, UsersService, TwoFaService]
})
export class ProfileModule {}
