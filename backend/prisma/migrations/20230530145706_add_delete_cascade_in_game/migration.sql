/*
  Warnings:

  - You are about to drop the column `duration` on the `games` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_loserId_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_winnerId_fkey";

-- AlterTable
ALTER TABLE "games" DROP COLUMN "duration",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
