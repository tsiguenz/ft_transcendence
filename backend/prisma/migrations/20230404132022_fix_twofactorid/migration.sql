/*
  Warnings:

  - You are about to drop the column `createdAt` on the `two_factor_ids` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "two_factor_ids" DROP CONSTRAINT "two_factor_ids_userId_fkey";

-- AlterTable
ALTER TABLE "two_factor_ids" DROP COLUMN "createdAt";

-- AddForeignKey
ALTER TABLE "two_factor_ids" ADD CONSTRAINT "two_factor_ids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
