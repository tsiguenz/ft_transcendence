import {
  Controller,
  Get,
  Param,
  UseGuards,
  Delete,
  Req,
  Post,
  Body
} from '@nestjs/common';
import {
  ApiParam,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guard';
import { Request } from 'express';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
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

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are deleting'
  })
  @Delete(':nickname')
  deleteUser(@Param('nickname') nickname: string, @Req() req: Request) {
    return this.usersService.deleteUser(nickname, req.user['nickname']);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        friendNickname: {
          type: 'string',
          description: 'Nickname of the user you want to add as a friend'
        }
      }
    }
  })
  @Post(':userNickname/friends')
  addFriend(
    @Param('userNickname') userNickname: string,
    @Body('friendNickname') friendNickname: string,
    @Req() req: Request
  ) {
    return this.usersService.addFriend(
      userNickname,
      friendNickname,
      req.user['id']
    );
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Delete(':nickname/friends/:friendNickname')
  deleteFriend(
    @Param('nickname') userNickname: string,
    @Param('friendNickname') friendNickname: string,
    @Req() req: Request
  ) {
    return this.usersService.deleteFriend(
      userNickname,
      friendNickname,
      req.user['id']
    );
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get(':nickname/friends')
  getFriends(@Param('nickname') nickname: string, @Req() req: Request) {
    return this.usersService.getFriends(nickname, req.user['id']);
  }
}
