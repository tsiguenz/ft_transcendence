-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_chatRoomId_fkey";

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chatrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
