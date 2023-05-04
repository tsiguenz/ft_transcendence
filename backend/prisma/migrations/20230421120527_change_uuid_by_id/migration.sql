/*
  Warnings:

  - The primary key for the `two_factor_ids` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `two_factor_ids` table. All the data in the column will be lost.
  - The required column `id` was added to the `two_factor_ids` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "two_factor_ids" DROP CONSTRAINT "two_factor_ids_pkey",
DROP COLUMN "uuid",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "two_factor_ids_pkey" PRIMARY KEY ("id");
