import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
      ConfigModule.forRoot({
        envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      }),
      AuthModule,
      UserModule,
      PrismaModule
    ],
  controllers: [],
  providers: [],
})
export class AppModule {}
