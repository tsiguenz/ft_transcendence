import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFaService } from './2fa.service';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard';

@ApiTags('2fa')
@Controller('api/2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get('generate-qrcode')
  async generateQrCode(@Req() req: Request) {
    const secret = await this.twoFaService.createSecret(req.user['id']);
    return this.twoFaService.generateQrCodeDataURL(secret.otpauth_url);
  }
}
