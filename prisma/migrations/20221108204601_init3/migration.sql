/*
  Warnings:

  - The `Cumulative_Buy` column on the `SPL` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SPL" DROP COLUMN "Cumulative_Buy",
ADD COLUMN     "Cumulative_Buy" REAL;
