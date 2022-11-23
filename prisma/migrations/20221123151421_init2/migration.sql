/*
  Warnings:

  - You are about to drop the column `ConsumedFifo` on the `Fifo` table. All the data in the column will be lost.
  - You are about to drop the column `RemainingFifo` on the `Fifo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Fifo" DROP COLUMN "ConsumedFifo",
DROP COLUMN "RemainingFifo";
