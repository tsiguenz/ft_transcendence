import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';

import { Request } from 'express';
import { AccessTokenGuard } from '../auth/guard';
import { ChatroomService } from './chatroom.service';
import { CreateChatroomDto, UpdateChatroomDto } from './dto';

@Controller('api/chatrooms')
@ApiTags('chatrooms')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Chatroom name' }
      }
    }
  })
  @Post()
  async create(
    @Body() createChatroomDto: CreateChatroomDto,
    @Req() req: Request
  ) {
    return await this.chatroomService.create(
      req.user['id'],
      createChatroomDto
    );
  }

  // @UseGuards(AccessTokenGuard)
  // @ApiBearerAuth()
  // @Get()
  // async findAll() {
  //   return await this.chatroomService.findAll();
  // }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('mine')
  async findChatroomsForUser(@Req() req: Request) {
    return await this.chatroomService.findChatroomsForUser(req.user['id']);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('joinable')
  async findJoinableChatroomsForUser(@Req() req: Request) {
    return await this.chatroomService.findJoinableChatroomsForUser(
      req.user['id']
    );
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
  @Get(':id/users')
  async findChatroomUsers(@Req() req: Request, @Param('id') id: string) {
    const currentUserId = req.user['id'];
    const users = await this.chatroomService.findChatroomUsers(id);
    if (!users.find(u => u.id == currentUserId)) {
      throw new ForbiddenException('Unauthorized to list users');
    }
    const formattedUsers = users.map((user) => ({
      id: user.id,
      nickname: user.nickname,
      role: user.chatrooms[0].role
    }));
    return formattedUsers;
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChatroomDto: UpdateChatroomDto
  ) {
    return this.chatroomService.update(id, updateChatroomDto);
  }

  // @UseGuards(AccessTokenGuard)
  // @ApiBearerAuth()
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  //   description: 'Chatroom id'
  // })
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.chatroomService.remove(id);
  // }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @Post(':id/join')
  async joinRoom(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('password') password: string
  ) {
    return await this.chatroomService.join(req.user['id'], id, password);
  }
}
