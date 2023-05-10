-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- AlterTable
ALTER TABLE "chatrooms_users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
