-- DropForeignKey
ALTER TABLE "AccountingJE" DROP CONSTRAINT "AccountingJE_CryptoDBid_fkey";

-- DropForeignKey
ALTER TABLE "AccountingJE" DROP CONSTRAINT "AccountingJE_FifoDBid_fkey";

-- DropForeignKey
ALTER TABLE "Fifo" DROP CONSTRAINT "Fifo_sPLId_fkey";

-- AddForeignKey
ALTER TABLE "Fifo" ADD CONSTRAINT "Fifo_sPLId_fkey" FOREIGN KEY ("sPLId") REFERENCES "SPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJE" ADD CONSTRAINT "AccountingJE_CryptoDBid_fkey" FOREIGN KEY ("CryptoDBid") REFERENCES "SPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingJE" ADD CONSTRAINT "AccountingJE_FifoDBid_fkey" FOREIGN KEY ("FifoDBid") REFERENCES "Fifo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
