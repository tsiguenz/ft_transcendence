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
  Redirect
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

  @Get('42')
  @UseGuards(FortyTwoGuard)
  async fortyTwoAuth() {}

  @Redirect('http://' + process.env.HOST_IP + ':8080/home')
  @UseGuards(FortyTwoGuard)
  @Get('42/callback')
  async fortyTwoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const token = await this.authService.fortyTwoLogin(req.user);
    res.cookie('jwt', token.access_token);
    return res.status(HttpStatus.OK);
  }
}
