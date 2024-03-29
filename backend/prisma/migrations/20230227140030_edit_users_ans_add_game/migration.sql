/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('LADDER', 'CUSTOM');

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "ladderPoints" INTEGER NOT NULL DEFAULT 0,
    "avatar" BYTEA,
    "twoFactorEnable" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "type" "GameType" NOT NULL,
    "winnerId" INTEGER NOT NULL,
    "looserId" INTEGER NOT NULL,
    "previousWinnerRating" INTEGER NOT NULL,
    "previousLooserRating" INTEGER NOT NULL,
    "winnerScore" INTEGER NOT NULL DEFAULT 0,
    "looserScore" INTEGER NOT NULL DEFAULT 0,
    "duration" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_looserId_fkey" FOREIGN KEY ("looserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
