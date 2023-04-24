import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';

import { Request } from 'express';
import { JwtGuard } from '../auth/guard';
import { ChatroomService } from './chatroom.service';
import { CreateChatroomDto, UpdateChatroomDto } from './dto';

@Controller('api/chatrooms')
@ApiTags('chatrooms')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @UseGuards(JwtGuard)
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
      Number.parseInt(req.user['id']),
      createChatroomDto
    );
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get()
  async findAll() {
    return await this.chatroomService.findAll();
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get('mine')
  async findChatroomsForUser(@Req() req: Request) {
    return await this.chatroomService.findChatroomsForUser(req.user['id']);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get('joinable')
  async findJoinableChatroomsForUser(@Req() req: Request) {
    return await this.chatroomService.findJoinableChatroomsForUser(
      req.user['id']
    );
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    description: 'Chatroom id'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatroomService.findOne(+id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    description: 'Chatroom id'
  })
  @Get(':id/users')
  async findChatroomUsers(@Param('id') id: string) {
    const users = await this.chatroomService.findChatroomUsers(+id);
    const formattedUsers = users.map((user) => ({
      id: user.id,
      nickname: user.nickname,
      role: user.chatrooms[0].role
    }));
    return formattedUsers;
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    description: 'Chatroom id'
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChatroomDto: UpdateChatroomDto
  ) {
    return this.chatroomService.update(+id, updateChatroomDto);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    description: 'Chatroom id'
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatroomService.remove(+id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    description: 'Chatroom id'
  })
  @Post(':id/join')
  async joinRoom(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('password') password: string
  ) {
    return await this.chatroomService.join(req.user['id'], +id, password);
  }
}
