import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatroomDto, UpdateChatroomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatroomService {
  private static DEFAULT_CHATROOM = 'general';

  constructor(private prisma: PrismaService) {}
  async create(userId: number, dto: CreateChatroomDto) {
    try {
      const chatroom = await this.prisma.chatRoom.create({
        data: {
          name: dto.name,
          users: { create: [{ user: { connect: { id: userId } } }] }
        }
      });
      return chatroom;
    } catch (e) {
      throw new NotFoundException('Could not create chatroom');
    }
  }

  async findAll() {
    return await this.prisma.chatRoom.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.chatRoom.findUnique({ where: { id } });
  }

  update(id: number, updateChatroomDto: UpdateChatroomDto) {
    return `This action updates a #${id} chatroom`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatroom`;
  }

  async join(userId: number, chatroomId: number) {
    // Check if user is able to join chatroom
    // Aff user to chatroom users
  }

  async leave(userId: number, chatroomId: number) {
    // Check if user is able to leave chatroom
    // Aff user to chatroom users
  }

  async findOrCreateDefaultChatroom() {
    let defaultChatroom = await this.prisma.chatRoom.findUnique({ where: { name: ChatroomService.DEFAULT_CHATROOM } });
    if (!defaultChatroom) {
      defaultChatroom = await this.prisma.chatRoom.create({ data: { name: ChatroomService.DEFAULT_CHATROOM } });
    }
    return defaultChatroom;
  }
}
