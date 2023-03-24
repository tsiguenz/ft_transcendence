/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `chatrooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `chatrooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chatrooms" ADD COLUMN     "slug" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "chatrooms_slug_key" ON "chatrooms"("slug");
