/*
  Warnings:

  - You are about to drop the column `file_url` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `tenders` table. All the data in the column will be lost.
  - Added the required column `description` to the `proposals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ALTER COLUMN "name" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "proposals" DROP COLUMN "file_url",
DROP COLUMN "message",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "file_id" VARCHAR(24);

-- AlterTable
ALTER TABLE "tenders" DROP COLUMN "file_url",
ADD COLUMN     "file_id" VARCHAR(24);

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
