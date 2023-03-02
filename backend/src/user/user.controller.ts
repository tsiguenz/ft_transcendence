import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Patch
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('api/user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: "Nickname of the user you're searching"
  })
  @Get(':nickname')
  getUser(@Param('nickname') nickname: string) {
    return this.userService.getUser(nickname);
  }

  // broken
  @Get('get-all-users')
  getAllUsers() {
    console.log('get all users');
    return this.userService.getAllUsers();
  }

  // broken
  @ApiTags('user')
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you want to turn on 2fa'
  })
  // broken if we have nickname who is a route ?
  @Patch(':nickname/2fa/turn-on')
  turnOn2fa(@Param() nickname: string) {
    try {
      this.userService.turnOn2fa(nickname);
    } catch (e) {
      console.log(e);
      return e;
    }
    return { message: '2fa turned on' };
  }
}
