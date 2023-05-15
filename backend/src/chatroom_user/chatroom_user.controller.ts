import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
import { ChatroomUserService } from './chatroom_user.service';
import { User } from '../decorator/user.decorator';
import { Role } from '@prisma/client';

@Controller('api/chatrooms/:chatroomId/users')
@ApiTags('chatrooms_users')
export class ChatroomUserController {
  constructor(private readonly chatroomUserService: ChatroomUserService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'chatroomId',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @Get()
  async findAll(@User() user: object, @Param('chatroomId') chatroomId: string) {
    const currentUserId = user['id'];
    const users = await this.chatroomUserService.findAll(chatroomId);
    if (!users.find((u) => u.id == currentUserId)) {
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
    name: 'chatroomId',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'User id'
  })
  @Post(':id/promote')
  async promote(@User() user: object, @Param('chatroomId') chatroomId: string, @Param('id') userId: string) {
    if (!(await this.chatroomUserService.isUserOwner(user['id'], chatroomId)) || !(await this.chatroomUserService.userHasRole(userId, chatroomId, Role.USER))) {
      throw new ForbiddenException("Unauthorized to promote user");
    }
    return await this.chatroomUserService.setUserRole(userId, chatroomId, Role.ADMIN);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'chatroomId',
    type: String,
    required: true,
    description: 'Chatroom id'
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'User id'
  })
  @Post(':id/demote')
  async demote(@User() user: object, @Param('chatroomId') chatroomId: string, @Param('id') userId: string) {
    if (!(await this.chatroomUserService.isUserOwner(user['id'], chatroomId)) || !(await this.chatroomUserService.isUserAdmin(userId, chatroomId))) {
      throw new ForbiddenException("Unauthorized to demote user");
    }
    return await this.chatroomUserService.setUserRole(userId, chatroomId, Role.USER);
  }

}