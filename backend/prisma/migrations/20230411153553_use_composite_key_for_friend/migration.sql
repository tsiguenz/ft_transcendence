/*
  Warnings:

  - The primary key for the `friends` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `friend` on the `friends` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `friends` table. All the data in the column will be lost.
  - You are about to drop the column `initiatorId` on the `friends` table. All the data in the column will be lost.
  - Added the required column `friendNickname` to the `friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `friends` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_initiatorId_fkey";

-- AlterTable
ALTER TABLE "friends" DROP CONSTRAINT "friends_pkey",
DROP COLUMN "friend",
DROP COLUMN "id",
DROP COLUMN "initiatorId",
ADD COLUMN     "friendNickname" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "friends_pkey" PRIMARY KEY ("userId", "friendNickname");

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
