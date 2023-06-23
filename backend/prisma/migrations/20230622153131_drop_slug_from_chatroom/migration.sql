/*
  Warnings:

  - You are about to drop the column `slug` on the `chatrooms` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "chatrooms_slug_key";

-- AlterTable
ALTER TABLE "chatrooms" DROP COLUMN "slug";
