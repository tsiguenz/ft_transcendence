-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('PRIVATE', 'PROTECTED', 'PUBLIC');

-- AlterTable
ALTER TABLE "chatrooms" ADD COLUMN     "hash" TEXT,
ADD COLUMN     "type" "RoomType" NOT NULL DEFAULT 'PUBLIC';
