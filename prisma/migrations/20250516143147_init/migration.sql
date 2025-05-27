/*
  Warnings:

  - You are about to drop the `Proposals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Proposals" DROP CONSTRAINT "Proposals_tenderId_fkey";

-- DropForeignKey
ALTER TABLE "Proposals" DROP CONSTRAINT "Proposals_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tenders" DROP CONSTRAINT "Tenders_userId_fkey";

-- DropTable
DROP TABLE "Proposals";

-- DropTable
DROP TABLE "Tenders";

-- CreateTable
CREATE TABLE "tenders" (
    "id" VARCHAR(24) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" VARCHAR(24) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "deliveryTime" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "matchPercent" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
