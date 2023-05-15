-- DropForeignKey
ALTER TABLE "chatrooms_users" DROP CONSTRAINT "chatrooms_users_chatRoomId_fkey";

-- AddForeignKey
ALTER TABLE "chatrooms_users" ADD CONSTRAINT "chatrooms_users_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chatrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
