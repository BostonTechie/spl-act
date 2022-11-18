/*
  Warnings:

  - You are about to drop the column `Objectd` on the `SPL` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SPL" DROP COLUMN "Objectd",
ADD COLUMN     "Fifo" JSONB;
