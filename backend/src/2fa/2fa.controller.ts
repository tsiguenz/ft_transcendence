import { Controller, Get, Post, UseGuards, Req, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TwoFaService } from './2fa.service';
import { Request } from 'express';
import { AccessTokenGuard } from '../auth/guard';
import { AuthService } from '../auth/auth.service';

@ApiTags('2fa')
@Controller('api/2fa')
export class TwoFaController {
  constructor(
    private readonly twoFaService: TwoFaService,
    private readonly authService: AuthService
  ) {}
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('generate-qrcode')
  async generateQrCode(@Req() req: Request) {
    const secret = await this.twoFaService.createSecret(req.user['id']);
    return this.twoFaService.generateQrCodeDataURL(secret.otpauth_url);
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Two factor code' },
        id: {
          type: 'string',
          description: 'ID of the user to verify the two factor code'
        }
      }
    }
  })
  @Post('verify')
  async verify(@Body('code') code: string, @Body('id') id: string) {
    const res = await this.twoFaService.verifyTwoFaRoute(id, Number(code));
    await this.twoFaService.deleteTwoFaId(id);
    if (!res || !res.ret) {
      return { message: 'Invalid two factor code' };
    }
    const tokens = await this.authService.createAndUpdateTokens(res.userId);
    return {
      nickname: res.nickname,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    };
  }
}
