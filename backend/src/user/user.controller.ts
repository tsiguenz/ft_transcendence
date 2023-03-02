import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('api/user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}
  @ApiTags('user')
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
  //  @Patch()
  //  editUser(@GetUser() user: User, @Body() dto: EditUserDto) {
  //    return this.userService.editUser(user, dto);
  //  }

  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: "Nickname of the user you're searching"
  })
  @Get('get-user')
  getUser(@Query('nickname') nickname: string) {
    return this.userService.getUser(nickname);
  }

  @Get('get-all-users')
  getAllUsers() {
    return this.userService.getAllUsers();
  }
}
