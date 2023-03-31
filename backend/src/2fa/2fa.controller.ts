import { Controller, Get, Post, UseGuards, Req, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TwoFaService } from './2fa.service';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard';
import { AuthService } from '../auth/auth.service';

@ApiTags('2fa')
@Controller('api/2fa')
export class TwoFaController {
  constructor(
    private readonly twoFaService: TwoFaService,
    private readonly authService: AuthService
  ) {}
  @UseGuards(JwtGuard)
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
          description: 'User id'
        }
      }
    }
  })
  @Post('verify')
  // TODO: use dto and use uuid or something else instead of id
  // tmp random string can be used to verify the user
  async verify(@Body('code') code: string, @Body('id') id: string) {
    const res = await this.twoFaService.verifyTwoFaRoute(
      Number(id),
      Number(code)
    );
    if (!res || !res.ret) return { message: 'Invalid two factor code' };
    const jwt = await this.authService.createJwt(Number(id));
    return {
      nickname: res.nickname,
      access_token: jwt.access_token
    };
  }
}
