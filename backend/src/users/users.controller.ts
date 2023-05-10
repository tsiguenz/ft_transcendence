import {
  Controller,
  Get,
  Param,
  UseGuards,
  Delete,
  Req,
  Post,
  ForbiddenException
} from '@nestjs/common';
import { ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '../auth/guard';
import { Request } from 'express';
import { ChatroomService } from '../chatroom/chatroom.service';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService, private readonly chatroomService: ChatroomService) {}

  @UseGuards(AccessTokenGuard)
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

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(AccessTokenGuard)
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

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'friendNickname',
    type: String,
    required: true,
    description: 'Nickname of the friend you are adding'
  })
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are adding a friend to'
  })
  @Post(':nickname/friends/:friendNickname')
  addFriend(
    @Param('nickname') nickname: string,
    @Param('friendNickname') friendNickname: string,
    @Req() req: Request
  ) {
    return this.usersService.addFriend(
      nickname,
      friendNickname,
      req.user['id']
    );
  }

  @UseGuards(AccessTokenGuard)
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

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(':nickname/friends')
  getFriends(@Param('nickname') nickname: string, @Req() req: Request) {
    return this.usersService.getFriends(nickname, req.user['id']);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(':nickname/chatrooms')
  async findChatroomsForUser(@Param('nickname') nickname: string, @Req() req: Request) {
    const user = await this.usersService.getUser(nickname);
    if (user.id !== req.user['id']) { throw new ForbiddenException('Unauthorized to list chatrooms for user'); }
    return await this.chatroomService.findChatroomsForUser(req.user['id']);
  }
}
