/*
  Warnings:

  - You are about to drop the column `createdAt` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `looserId` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `looserScore` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `previousLooserRating` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `games` table. All the data in the column will be lost.
  - Added the required column `isRanked` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loserId` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loserScore` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousLoserRating` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_looserId_fkey";

-- AlterTable
ALTER TABLE "games" DROP COLUMN "createdAt",
DROP COLUMN "looserId",
DROP COLUMN "looserScore",
DROP COLUMN "previousLooserRating",
DROP COLUMN "type",
ADD COLUMN     "isRanked" BOOLEAN NOT NULL,
ADD COLUMN     "loserId" TEXT NOT NULL,
ADD COLUMN     "loserScore" INTEGER NOT NULL,
ADD COLUMN     "previousLoserRating" INTEGER NOT NULL,
ALTER COLUMN "winnerScore" DROP DEFAULT,
ALTER COLUMN "duration" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "GameType";

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
