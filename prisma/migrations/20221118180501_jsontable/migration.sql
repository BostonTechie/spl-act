/*
  Warnings:

  - You are about to drop the column `BalanceRX` on the `SPL` table. All the data in the column will be lost.
  - You are about to drop the column `Fifo` on the `SPL` table. All the data in the column will be lost.
  - You are about to drop the column `Realized` on the `SPL` table. All the data in the column will be lost.
  - Added the required column `FifoDBid` to the `AccountingJE` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccountingJE" ADD COLUMN     "FifoDBid" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SPL" DROP COLUMN "BalanceRX",
DROP COLUMN "Fifo",
DROP COLUMN "Realized";

-- CreateTable
CREATE TABLE "Fifo" (
    "id" SERIAL NOT NULL,
    "Realized" DECIMAL(65,6),
    "Fifo" JSONB,
    "LevelFifo" JSONB,
    "ConsumedFifo" JSONB,
    "RemainingFifo" JSONB,
    "sPLId" INTEGER,

    CONSTRAINT "Fifo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fifo_id_key" ON "Fifo"("id");

-- AddForeignKey
ALTER TABLE "Fifo" ADD CONSTRAINT "Fifo_sPLId_fkey" FOREIGN KEY ("sPLId") REFERENCES "SPL"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJE" ADD CONSTRAINT "AccountingJE_FifoDBid_fkey" FOREIGN KEY ("FifoDBid") REFERENCES "Fifo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
