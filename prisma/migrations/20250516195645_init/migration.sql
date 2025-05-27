/*
  Warnings:

  - You are about to drop the column `createdAt` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryTime` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `matchPercent` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `tenderId` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tenders` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `tenders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tenders` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `tenders` table. All the data in the column will be lost.
  - Added the required column `delivery_time` to the `proposals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tender_id` to the `proposals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `proposals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `tenders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_tenderId_fkey";

-- DropForeignKey
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_userId_fkey";

-- DropForeignKey
ALTER TABLE "tenders" DROP CONSTRAINT "tenders_userId_fkey";

-- AlterTable
ALTER TABLE "proposals" DROP COLUMN "createdAt",
DROP COLUMN "deliveryTime",
DROP COLUMN "fileUrl",
DROP COLUMN "matchPercent",
DROP COLUMN "tenderId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" VARCHAR(24),
ADD COLUMN     "deleted_at" TIMESTAMPTZ,
ADD COLUMN     "deleted_by" VARCHAR(24),
ADD COLUMN     "delivery_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "file_url" TEXT,
ADD COLUMN     "match_percent" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "tender_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_by" VARCHAR(24),
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tenders" DROP COLUMN "createdAt",
DROP COLUMN "fileUrl",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" VARCHAR(24),
ADD COLUMN     "deleted_at" TIMESTAMPTZ,
ADD COLUMN     "deleted_by" VARCHAR(24),
ADD COLUMN     "file_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_by" VARCHAR(24),
ADD COLUMN     "user_id" VARCHAR(24) NOT NULL;

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
