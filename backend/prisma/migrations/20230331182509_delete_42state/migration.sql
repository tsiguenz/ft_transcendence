/*
  Warnings:

  - You are about to drop the column `api42State` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_api42State_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "api42State";
