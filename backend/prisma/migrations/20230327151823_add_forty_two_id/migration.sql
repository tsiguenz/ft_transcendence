/*
  Warnings:

  - A unique constraint covering the columns `[fortyTwoId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fortyTwoId" INTEGER,
ALTER COLUMN "hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_fortyTwoId_key" ON "users"("fortyTwoId");
