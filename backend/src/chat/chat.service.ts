import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async getMessages() {
		return await this.prisma.message.findMany({ include: { author: true } });
	}
}
