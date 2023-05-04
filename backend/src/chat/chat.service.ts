import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatroomService } from '../chatroom/chatroom.service';

@Injectable()
export class ChatService {
	constructor(
		private prisma: PrismaService,
		private chatroom: ChatroomService
	) {}

	async getMessages(chatroomId: string, newerThan: Date = new Date(null)) {
		return await this.prisma.message.findMany({
			where: {
				chatRoom: {
					id: chatroomId
				},
				createdAt: {
					gt: newerThan
				}
			},
			orderBy: {
				createdAt: 'asc'
			},
			include: { author: true }
		});
	}

	async saveMessage(userId: string, chatRoomId: string, message: string) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		const chatroomUser = await this.chatroom.findUserInChatroom(userId, chatRoomId);
		const chatroom = await this.chatroom.findOne(chatRoomId);
		if (!user || !chatroomUser || !chatroom) {
			throw new Error('Cannot save message');
		}

		return await this.prisma.message.create({
			data: {
				chatRoomId: chatroom.id,
				authorId: user.id,
				content: message
			}
		});
	}
}
