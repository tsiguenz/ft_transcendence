-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('LADDER', 'CUSTOM');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "ladderPoints" INTEGER NOT NULL DEFAULT 0,
    "avatar" BYTEA,
    "twofa" BOOLEAN NOT NULL DEFAULT false,
    "OAuth" BOOLEAN NOT NULL DEFAULT false,
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
