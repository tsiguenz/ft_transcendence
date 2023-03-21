import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatroomService } from '../chatroom/chatroom.service';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService, private chatroom: ChatroomService) {}

	async getMessages(chatroomId: number) {
		return await this.prisma.message.findMany({
			where: {
				chatRoom: {
					id: chatroomId,
				}
			},
			include: { author: true }
		});
	}

	async saveMessage(userId: number, message: string) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		const chatroom = await this.chatroom.findOrCreateDefaultChatroom();
		if (!user) { throw new Error('User not found'); }

		await this.prisma.message.create({
			data: {
				chatRoomId: chatroom.id,
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
