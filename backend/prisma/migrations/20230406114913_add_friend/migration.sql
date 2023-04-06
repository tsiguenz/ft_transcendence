-- CreateTable
CREATE TABLE "friends" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
