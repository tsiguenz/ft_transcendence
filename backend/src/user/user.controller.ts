import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  //  @Patch()
  //  editUser(@GetUser() user: User, @Body() dto: EditUserDto) {
  //    return this.userService.editUser(user, dto);
  //  }
}
