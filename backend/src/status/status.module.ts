import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';

@Module({
  providers: [StatusGateway]
})
export class StatusModule {}
