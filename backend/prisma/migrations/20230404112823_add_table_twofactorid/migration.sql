-- CreateTable
CREATE TABLE "two_factor_ids" (
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_ids_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_ids_userId_key" ON "two_factor_ids"("userId");

-- AddForeignKey
ALTER TABLE "two_factor_ids" ADD CONSTRAINT "two_factor_ids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
