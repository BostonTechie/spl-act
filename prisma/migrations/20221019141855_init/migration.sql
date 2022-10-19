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
    "Amount" REAL,
    "Balance" REAL,
    "Price" REAL,
    "inUSD" REAL,
    "Created Date" TIMESTAMP(3),
    "Account" TEXT,
    "Index" INTEGER,

    CONSTRAINT "SPL_pkey" PRIMARY KEY ("id")
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
    "Debit" REAL DEFAULT 0,
    "Credit" REAL DEFAULT 0,
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
    "Realized" BOOLEAN DEFAULT false,
    "Sale" "Sale",
    "Notes" TEXT,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History_price" (
    "id" SERIAL NOT NULL,
    "Asset" TEXT,
    "Date" TIMESTAMP(3),
    "Open" REAL DEFAULT 0,
    "High" REAL DEFAULT 0,
    "Low" REAL DEFAULT 0,
    "Close" REAL DEFAULT 0,
    "Adj_Close" REAL DEFAULT 0,
    "Volume" REAL DEFAULT 0,

    CONSTRAINT "History_price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SPL_id_key" ON "SPL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingJE_id_key" ON "AccountingJE"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Ledger_id_key" ON "Ledger"("id");

-- CreateIndex
CREATE UNIQUE INDEX "History_price_id_key" ON "History_price"("id");

-- AddForeignKey
ALTER TABLE "AccountingJE" ADD CONSTRAINT "AccountingJE_CryptoDBid_fkey" FOREIGN KEY ("CryptoDBid") REFERENCES "SPL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
