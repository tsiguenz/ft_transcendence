/*
  Warnings:

  - A unique constraint covering the columns `[api42State]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "api42State" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_api42State_key" ON "users"("api42State");
