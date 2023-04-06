/*
  Warnings:

  - You are about to drop the column `friendId` on the `friends` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `friends` table. All the data in the column will be lost.
  - Added the required column `friend` to the `friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initiatorId` to the `friends` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_userId_fkey";

-- AlterTable
ALTER TABLE "friends" DROP COLUMN "friendId",
DROP COLUMN "userId",
ADD COLUMN     "friend" TEXT NOT NULL,
ADD COLUMN     "initiatorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
