import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiParam, ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';
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
        pseudo: { type: 'string', description: 'A unique nickname' },
        email: { type: 'string', description: 'A unique and valid email' },
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
        pseudo: { type: 'string', description: 'Nickname of an existing user' },
        password: { type: 'string', description: 'Password of the user' }
      }
    }
  })
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: "Nickname of the user you're searching"
  })
  @Get('get-user')
  getUser(@Query('nickname') nickname: string) {
    return this.authService.getUser(nickname);
  }

  @Get('get-all-users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }
}
