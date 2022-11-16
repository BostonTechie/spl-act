/*
  Warnings:

  - You are about to alter the column `Debit` on the `AccountingJE` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Credit` on the `AccountingJE` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Open` on the `History_price_DEC` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `High` on the `History_price_DEC` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Low` on the `History_price_DEC` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Close` on the `History_price_DEC` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Adj_Close` on the `History_price_DEC` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Volume` on the `History_price_DEC` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Open` on the `History_price_SPS` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `High` on the `History_price_SPS` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Low` on the `History_price_SPS` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Close` on the `History_price_SPS` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Adj_Close` on the `History_price_SPS` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Volume` on the `History_price_SPS` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Amount` on the `SPL` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Balance` on the `SPL` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Price` on the `SPL` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `inUSD` on the `SPL` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Cumulative_Buy` on the `SPL` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Prev_Cumulative_Buy` on the `SPL` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Cumulative_Sell` on the `SPL` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.
  - You are about to alter the column `Prev_Cumulative_Sell` on the `SPL` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,6)`.

*/
-- AlterTable
ALTER TABLE "AccountingJE" ALTER COLUMN "Debit" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Credit" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "History_price_DEC" ALTER COLUMN "Open" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "High" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Low" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Close" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Adj_Close" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Volume" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "History_price_SPS" ALTER COLUMN "Open" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "High" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Low" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Close" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Adj_Close" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Volume" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "SPL" ALTER COLUMN "Amount" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Balance" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Price" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "inUSD" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Cumulative_Buy" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Prev_Cumulative_Buy" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Cumulative_Sell" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "Prev_Cumulative_Sell" SET DATA TYPE DECIMAL(65,6);
