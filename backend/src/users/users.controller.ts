import {
  Controller,
  Get,
  Param,
  UseGuards,
  Delete,
  Post,
  ForbiddenException,
  NotFoundException,
  Put,
  Body,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiParam,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '../auth/guard';
import { User } from '../decorator/user.decorator';
import { EditProfileDto } from './dto/profile-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ChatroomService } from '../chatroom/chatroom.service';
import { IsCurrentUserGuard } from '../users/guard/isCurrentUser.guard';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly chatroomService: ChatroomService
  ) {}

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

  @UseGuards(AccessTokenGuard, IsCurrentUserGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are deleting'
  })
  @Delete(':nickname')
  deleteUser(@User() user: object) {
    return this.usersService.deleteUser(user);
  }

  @UseGuards(AccessTokenGuard, IsCurrentUserGuard)
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
    @Param('friendNickname') friendNickname: string,
    @User() user: object
  ) {
    return this.usersService.addFriend(user, friendNickname);
  }

  @UseGuards(AccessTokenGuard, IsCurrentUserGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are deleting a friend from'
  })
  @Delete(':nickname/friends/:friendNickname')
  deleteFriend(
    @Param('friendNickname') friendNickname: string,
    @User() user: object
  ) {
    return this.usersService.deleteFriend(user, friendNickname);
  }

  @UseGuards(AccessTokenGuard, IsCurrentUserGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are getting friends from'
  })
  @Get(':nickname/friends')
  getFriends(@User() user: object) {
    return this.usersService.getFriends(user['id']);
  }

  @UseGuards(AccessTokenGuard, IsCurrentUserGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are getting the profile'
  })
  @Get(':nickname/profile')
  getProfile(@User() user: object) {
    return user;
  }

  @UseGuards(AccessTokenGuard, IsCurrentUserGuard)
  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are editing the profile'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        twoFactorEnable: {
          type: 'boolean',
          description: 'Enable or disable two factor authentication'
        }
      }
    }
  })
  @Put(':nickname/profile')
  editProfile(@Body() dto: EditProfileDto, @User() user: object) {
    return this.usersService.editProfile(user['id'], dto);
  }

  @UseGuards(AccessTokenGuard, IsCurrentUserGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are editing the avatar'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The avatar file'
        }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `/${randomName}${extname(file.originalname)}`);
        }
      })
    })
  )
  @Post(':nickname/avatar')
  async uploadAvatar(
    @User() user: object,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.usersService.uploadAvatar(user['id'], file);
  }

  @UseGuards(AccessTokenGuard, IsCurrentUserGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are getting the chatrooms'
  })
  @Get(':nickname/chatrooms')
  async findChatroomsForUser(@User() user: object) {
    return await this.usersService.chatrooms(user['id']);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are blocking'
  })
  @Post(':nickname/block')
  async blockUser(@Param('nickname') nickname: string, @User() user: object) {
    const toBlock = await this.usersService.getUser(nickname);
    if (!toBlock) throw new NotFoundException('User not found');
    if (toBlock.id === user['id']) {
      throw new ForbiddenException('You cannot block yourself');
    }

    return this.usersService.blockUser(user['id'], toBlock.id);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are unblocking'
  })
  @Post(':nickname/unblock')
  async unblockUser(@Param('nickname') nickname: string, @User() user: object) {
    const toUnblock = await this.usersService.getUser(nickname);
    if (!toUnblock) throw new NotFoundException('User not found');

    return this.usersService.unblockUser(user['id'], toUnblock.id);
  }

  @UseGuards(AccessTokenGuard, IsCurrentUserGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are getting the blocked users'
  })
  @Get(':nickname/blocked')
  async getBlockedUsers(
    @Param('nickname') nickname: string,
    @User() user: object
  ) {
    return this.usersService.getBlockedUsers(user['id']);
  }
}
