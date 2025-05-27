-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tenders" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
