import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async getMessages() {
		return await this.prisma.message.findMany({ include: { author: true } });
	}

	async saveMessage(userId: number, message: string) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!user) { throw new Error('User not found'); }
		await this.prisma.message.create({
			data: {
				chatRoomId: 1,
				authorId: user.id,
				content: message,
			}
		});
	}

	// TODO: Should be in a user service, somewhere
	async getUser(userId: number) {
		return await this.prisma.user.findUnique({ where: { id: userId } });
	}
}
