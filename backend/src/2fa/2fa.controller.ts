import { Controller, Get } from '@nestjs/common';
import { ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { TwoFaService } from './2fa.service';

@Controller('api/2fa')
@ApiTags('2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}
  @Get('generate')
  async generateQrCode() {
    return 'qrcode is generated';
  }
}
