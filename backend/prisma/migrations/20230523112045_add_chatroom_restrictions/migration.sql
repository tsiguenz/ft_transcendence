-- CreateEnum
CREATE TYPE "RestrictionType" AS ENUM ('MUTED', 'BANNED');

-- CreateTable
CREATE TABLE "chatrooms_restrictions" (
    "userId" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "type" "RestrictionType" NOT NULL,
    "restrictedUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatrooms_restrictions_pkey" PRIMARY KEY ("userId","chatRoomId")
);

-- AddForeignKey
ALTER TABLE "chatrooms_restrictions" ADD CONSTRAINT "chatrooms_restrictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatrooms_restrictions" ADD CONSTRAINT "chatrooms_restrictions_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chatrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
