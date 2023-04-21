import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

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
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description:
            'Authorization code returned by the 42 API after the user has logged in'
        }
      }
    }
  })
  @Post('42')
  async signin42(@Body('authorization') authorizationCode: string) {
    return await this.authService.signin42(authorizationCode);
  }
}
