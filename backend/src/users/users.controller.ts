import {
  Controller,
  Get,
  Param,
  UseGuards,
  Delete,
  Post,
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

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'nickname',
    type: String,
    required: true,
    description: 'Nickname of the user you are deleting'
  })
  @Delete(':nickname')
  deleteUser(@Param('nickname') nickname: string, @User() user: object) {
    this.usersService.checkIfUserIsMe(nickname, user['nickname']);
    return this.usersService.deleteUser(user);
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
    @User() user: object
  ) {
    this.usersService.checkIfUserIsMe(nickname, user['nickname']);
    return this.usersService.addFriend(user, friendNickname);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete(':nickname/friends/:friendNickname')
  deleteFriend(
    @Param('nickname') nickname: string,
    @Param('friendNickname') friendNickname: string,
    @User() user: object
  ) {
    this.usersService.checkIfUserIsMe(nickname, user['nickname']);
    return this.usersService.deleteFriend(user, friendNickname);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(':nickname/friends')
  getFriends(@Param('nickname') nickname: string, @User() user: object) {
    this.usersService.checkIfUserIsMe(nickname, user['nickname']);
    return this.usersService.getFriends(user['id']);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(':nickname/profile')
  getProfile(@Param('nickname') nickname: string, @User() user: object) {
    this.usersService.checkIfUserIsMe(nickname, user['nickname']);
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nickname: { type: 'string', description: 'The new unique nickname' },
        twoFactorEnable: {
          type: 'boolean',
          description: 'Enable or disable two factor authentication'
        }
      }
    }
  })
  @Put(':nickname/profile')
  editProfile(
    @Param('nickname') nickname: string,
    @Body() dto: EditProfileDto,
    @User() user: object
  ) {
    this.usersService.checkIfUserIsMe(nickname, user['nickname']);
    return this.usersService.editProfile(user['id'], dto);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
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
    @Param('nickname') nickname: string,
    @User() user: object,
    @UploadedFile() file: Express.Multer.File
  ) {
    this.usersService.checkIfUserIsMe(nickname, user['nickname']);
    return this.usersService.uploadAvatar(user['id'], file);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(':nickname/chatrooms')
  async findChatroomsForUser(
    @Param('nickname') nickname: string,
    @User() user: object
  ) {
    this.usersService.checkIfUserIsMe(nickname, user['nickname']);
    return await this.chatroomService.findChatroomsForUser(user['id']);
  }
}
