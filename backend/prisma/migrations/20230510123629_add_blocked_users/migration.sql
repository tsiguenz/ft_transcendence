-- CreateTable
CREATE TABLE "blocked_users" (
    "userId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,

    CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("userId","blockedId")
);

-- AddForeignKey
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
