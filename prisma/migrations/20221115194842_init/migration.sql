-- CreateEnum
CREATE TYPE "DLedger" AS ENUM ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense');

-- CreateEnum
CREATE TYPE "CLedger" AS ENUM ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense');

-- CreateEnum
CREATE TYPE "Sale" AS ENUM ('Buy', 'Sale');

-- CreateTable
CREATE TABLE "SPL" (
    "id" SERIAL NOT NULL,
    "Token" TEXT,
    "Type" TEXT,
    "From/To" TEXT,
    "Amount" DECIMAL,
    "Balance" DECIMAL,
    "Created Date" TIMESTAMP(3),
    "Account" TEXT,
    "Index" INTEGER,
    "Price" DECIMAL,
    "inUSD" DECIMAL,
    "Buy/Sell" TEXT,
    "Internal/External" TEXT,
    "Cumulative_Buy" DECIMAL,
    "Prev_Cumulative_Buy" DECIMAL,
    "Cumulative_Sell" DECIMAL,
    "Prev_Cumulative_Sell" DECIMAL,

    CONSTRAINT "SPL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing_Account" (
    "id" SERIAL NOT NULL,
    "Account" TEXT,

    CONSTRAINT "Listing_Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing_Token" (
    "id" SERIAL NOT NULL,
    "Token" TEXT,

    CONSTRAINT "Listing_Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingJE" (
    "id" SERIAL NOT NULL,
    "Entity" TEXT,
    "Wallet" TEXT,
    "Counterparty" TEXT,
    "Asset" TEXT,
    "Proceed_Date" TIMESTAMP(3),
    "Ledger_Type1" TEXT,
    "Ledger_Type2" TEXT,
    "Ledger_Name" TEXT,
    "Debit" DECIMAL DEFAULT 0,
    "Credit" DECIMAL DEFAULT 0,
    "CryptoDBid" INTEGER NOT NULL,
    "Duration" TEXT,
    "Notes" TEXT,

    CONSTRAINT "AccountingJE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" SERIAL NOT NULL,
    "Transaction Type" TEXT,
    "Dledger" "DLedger",
    "DLedger_SType" TEXT DEFAULT 'Liquid',
    "Cledger" "CLedger",
    "CLedger_SType" TEXT DEFAULT 'Deferred Revenue',
    "Real" BOOLEAN DEFAULT false,
    "Sale" "Sale",
    "Notes" TEXT,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History_price_DEC" (
    "id" SERIAL NOT NULL,
    "Asset" TEXT,
    "Date" TIMESTAMP(3),
    "Open" DECIMAL DEFAULT 0,
    "High" DECIMAL DEFAULT 0,
    "Low" DECIMAL DEFAULT 0,
    "Close" DECIMAL DEFAULT 0,
    "Adj_Close" DECIMAL DEFAULT 0,
    "Volume" DECIMAL DEFAULT 0,

    CONSTRAINT "History_price_DEC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History_price_SPS" (
    "id" SERIAL NOT NULL,
    "Asset" TEXT,
    "Date" TIMESTAMP(3),
    "Open" DECIMAL DEFAULT 0,
    "High" DECIMAL DEFAULT 0,
    "Low" DECIMAL DEFAULT 0,
    "Close" DECIMAL DEFAULT 0,
    "Adj_Close" DECIMAL DEFAULT 0,
    "Volume" DECIMAL DEFAULT 0,

    CONSTRAINT "History_price_SPS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SPL_id_key" ON "SPL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_Account_id_key" ON "Listing_Account"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_Token_id_key" ON "Listing_Token"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingJE_id_key" ON "AccountingJE"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Ledger_id_key" ON "Ledger"("id");

-- CreateIndex
CREATE UNIQUE INDEX "History_price_DEC_id_key" ON "History_price_DEC"("id");

-- CreateIndex
CREATE UNIQUE INDEX "History_price_SPS_id_key" ON "History_price_SPS"("id");

-- AddForeignKey
ALTER TABLE "AccountingJE" ADD CONSTRAINT "AccountingJE_CryptoDBid_fkey" FOREIGN KEY ("CryptoDBid") REFERENCES "SPL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;