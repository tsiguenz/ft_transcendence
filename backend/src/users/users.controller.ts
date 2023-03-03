import { Controller, Get, UseGuards, Param, Patch, Req } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Request } from 'express';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: "Nickname of the user you're searching"
  })
  @Get(':nickname')
  getUser(@Param('nickname') nickname: string) {
    return this.usersService.getUser(nickname);
  }

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you want to turn on 2fa'
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get(':nickname/profile')
  getProfile(@Param('nickname') nickname: string, @Req() req: Request) {
    // TODO: return 401 if user is not authorized
    return this.usersService.getProfile(nickname, req);
  }

  @Patch('2fa/turn-on')
  turnOn2fa(@Req() req: Request) {
    console.log(req.headers);
    return this.usersService.turnOn2fa(req);
  }

  @Patch('2fa/turn-off')
  turnOff2fa(@Req() req: Request) {
    return this.usersService.turnOff2fa(req);
  }
}
