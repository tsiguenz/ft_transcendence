import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatroomService } from '../chatroom/chatroom.service';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService, private chatroom: ChatroomService) {}

	async getMessages(chatroomId: number, newerThan: Date = new Date(null)) {
		return await this.prisma.message.findMany({
			where: {
				chatRoom: {
					id: chatroomId,
				},
				createdAt: {
					gte: newerThan,
				}
			},
			include: { author: true }
		});
	}

	async saveMessage(userId: number, chatRoomId: number, message: string) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		// TODO: Check if the user is in the chatroom
		const chatroom = await this.chatroom.findOne(chatRoomId);
		if (!user) { throw new Error('User not found'); }

		return await this.prisma.message.create({
			data: {
				chatRoomId: chatroom.id,
				authorId: user.id,
				content: message,
			}
		});
	}
}
