import { Controller, Get, UseGuards, Req, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFaService } from './2fa.service';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard';

@ApiTags('2fa')
@Controller('api/2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('generate-qrcode')
  async generateQrCode(@Req() req: Request) {
    const secret = await this.twoFaService.createSecret(req);
    return this.twoFaService.generateQrCodeDataURL(secret.otpauth_url);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('verify')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string'
        }
      }
    }
  })
  async verifyTwoFa(@Body('token') token: string, @Req() req: Request) {
    return this.twoFaService.verifyTwoFa(req, token);
  }
}
