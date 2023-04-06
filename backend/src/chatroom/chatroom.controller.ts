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
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

import { Request } from 'express';
import { JwtGuard } from '../auth/guard';
import { ChatroomService } from './chatroom.service';
import { CreateChatroomDto, UpdateChatroomDto } from './dto';

@Controller('api/chatrooms')
@ApiTags('chatrooms')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

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
  @UseGuards(JwtGuard)
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

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get()
  async findAll() {
    return await this.chatroomService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get('mine')
  async findChatroomsForUser(@Req() req: Request) {
    return await this.chatroomService.findChatroomsForUser(req.user['id']);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatroomService.findOne(+id);
  }

  @UseGuards(JwtGuard)
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChatroomDto: UpdateChatroomDto
  ) {
    return this.chatroomService.update(+id, updateChatroomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatroomService.remove(+id);
  }
}
