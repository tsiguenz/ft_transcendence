import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

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
}
