import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { FortyTwoGuard } from './guard';
import { Request, Response } from 'express';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nickname: { type: 'string', description: 'A unique nickname' },
        password: {
          type: 'string',
          description: 'A strong password (Currently not enforced)'
        }
      }
    }
  })
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nickname: {
          type: 'string',
          description: 'Nickname of an existing user'
        },
        password: { type: 'string', description: 'Password of the user' },
        twoFactorCode: {
          type: 'string',
          description: 'Two factor code (if enabled)'
        }
      }
    }
  })
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @UseGuards(FortyTwoGuard)
  @Get('42')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async fortyTwoAuth() {}

  // TODO: this route crash if we refresh it when code is already defined
  // because of the @UseGuards(FortyTwoGuard)
  // but I don't know how to fix it
  @UseGuards(FortyTwoGuard)
  @Get('42/callback')
  async fortyTwoCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') state: string
  ) {
    return await this.authService.fortyTwoAuth(res, req.user, state);
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Two factor code'
        }
      }
    }
  })
  @Post('42')
  async fortyTwoAuthVerify2fa(
    @Body('twoFa') twoFaCode: string,
    @Res() res: Response,
    @Query('state') state: string
  ) {
    return await this.authService.fortyTwoAuthWithTwoFa(
      res,
      Number(twoFaCode),
      state
    );
  }
}
