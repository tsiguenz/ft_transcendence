import { RoomType } from '@prisma/client';

export interface CreateChatroomPayload {
  name: string;
  type: RoomType;
  password: string;
}
