import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TwoFaService } from './2fa.service';
import { AccessTokenGuard } from '../auth/guard';
import { AuthService } from '../auth/auth.service';
import { User } from '../decorator/user.decorator';

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
  async generateQrCode(@User() user: object) {
    const secret = await this.twoFaService.createSecret(user['id']);
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
