import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  UnauthorizedException
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guard';
import { ChatroomService } from './chatroom.service';
import { ChatroomUserService } from '../chatroom_user/chatroom_user.service';
import { ChatroomRestrictionService } from '../chatroom_restriction/chatroom_restriction.service';
import { UpdateChatroomDto } from './dto';
import { User } from '../decorator/user.decorator';

@Controller('api/chatrooms')
@ApiTags('chatrooms')
export class ChatroomController {
  constructor(
    private readonly chatroomService: ChatroomService,
    private readonly chatroomUserService: ChatroomUserService,
    private readonly chatroomRestrictionService: ChatroomRestrictionService
  ) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('joinable')
  async findJoinableChatroomsForUser(@User() user: object) {
    return await this.chatroomService.findJoinableChatroomsForUser(user['id']);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatroomService.findOne(id);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          description: 'Chatroom password'
        }
      }
    }
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChatroomDto: UpdateChatroomDto,
    @User() user: object
  ) {
    if (!(await this.chatroomUserService.isUserOwner(user['id'], id))) {
      throw new UnauthorizedException('Unauthorized to edit room');
    }
    return this.chatroomService.update(id, updateChatroomDto);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @Delete(':id')
  async remove(@User() user: object, @Param('id') id: string) {
    if (!(await this.chatroomUserService.isUserOwner(user['id'], id))) {
      throw new UnauthorizedException('Unauthorized to delete room');
    }
    return this.chatroomService.remove(id);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @ApiParam({
    name: 'password',
    type: String,
    required: false,
    description: 'Chatroom password'
  })
  @Post(':id/join')
  async joinRoom(
    @User() user: object,
    @Param('id') id: string,
    @Body('password') password: string
  ) {
    if (await this.chatroomRestrictionService.isUserBanned(user['id'], id)) {
      throw new UnauthorizedException('Unauthorized to join room');
    }
    return await this.chatroomService.join(user['id'], id, password);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @Get(':id/restrictions')
  async getRestrictions(@Param('id') id: string, @User() user: object) {
    if (
      !(await this.chatroomUserService.isUserOwner(user['id'], id)) &&
      !(await this.chatroomUserService.isUserAdmin(user['id'], id))
    ) {
      throw new UnauthorizedException('Unauthorized to view restrictions');
    }
    return await this.chatroomRestrictionService.findAll(id);
  }
}
