import prisma from "./prisma/client";
// seems like I was having trouble mapping over a number and creating many off of that in this file

const v8 = require("v8");
const totalHeapSize = v8.getHeapStatistics().total_available_size;

async function producerReward() {
  console.log(v8.getHeapStatistics());
  let totalHeapSizeInGB = (totalHeapSize / 1024 / 1024 / 1024).toFixed(2);

  console.log(
    `total heap size (bytes) ${totalHeapSize}, (GB ~${totalHeapSizeInGB})`
  );

  //find all the coding needed for every transaction type from the ledger table to apply it to the Accounting JE table where realized Gain/Loss does not need to be calculated

  //tokens received is a seperate script to handle the tribe vs not tribe logic

  const findAllJeCoding = await prisma.ledger.findMany({
    where: { Realized: false, Transaction_Type: "PRODUCER_REWARD" },
    select: {
      id: true,
      Transaction_Type: true,
      Dledger: true,
      DLedger_SType: true,
      Cledger: true,
      CLedger_SType: true,
      Realized: true,
      Realized_Type: true,
      Sale: true,
    },
  });

  //the below for loop finds all the transactions that match the  transaction type (see the where clause)note all the tranaction types must exist in the legder table before this script will run correctly
  for (const elementJeCoding of findAllJeCoding) {
    let debitLedgerType = elementJeCoding.Dledger;
    let creditLedgerType = elementJeCoding.Cledger;
    let creditLedger = elementJeCoding.CLedger_SType;
    let debitLedger = elementJeCoding.DLedger_SType;
    let transType = elementJeCoding.Transaction_Type;
    //if the transaction type returns a true for the realized field that indicates realized needs to be calculated so the script will run the following script

    const findTransactionsTypeForThisLoop = await prisma.hive.findMany({
      distinct: ["id"],
      select: {
        id: true,
        Account_Ownership: true,
        Asset_Type: true,
        Asset: true,
        Account: true,
        Counterparty: true,
        Proceed_Date: true,
        Token_Price: true,
        Price_Symbol: true,
        Gross_Proceed: true,
        Cost_of_Basis: true,
        Net: true,
        Transaction_Type: true,
        Duration: true,
      },
      where: {
        Transaction_Type: elementJeCoding?.Transaction_Type,
      },

      // if you want to do a test run uncomment the below line
    });

    // console.log(findTransactionsTypeForThisLoop)

    // let count = 0

    //   for(let i = 0; i < updateFindToDebitJEdata.length; i++){

    //     count++

    //   }

    let updateFindEntity = findTransactionsTypeForThisLoop.map((obj) => {
      return {
        Entity: obj.Account_Ownership,
      };
    });

    let stringEntity = JSON.stringify(updateFindEntity);

    let updateFindWallet = findTransactionsTypeForThisLoop.map((obj) => {
      return {
        Wallet: obj.Account,
      };
    });

    let stringWallet = JSON.stringify(updateFindWallet);

    let updateFindCounter = findTransactionsTypeForThisLoop.map((obj) => {
      return {
        Counterparty: obj.Counterparty,
      };
    });

    let stringCounter = JSON.stringify(updateFindCounter);

    let updateFindAsset = findTransactionsTypeForThisLoop.map((obj) => {
      return {
        Asset: obj.Price_Symbol,
      };
    });

    let stringAsset = JSON.stringify(updateFindAsset);

    let updateFindDate = findTransactionsTypeForThisLoop.map((obj) => {
      return {
        Proceed_Date: obj.Proceed_Date,
      };
    });

    let stringDate = JSON.stringify(updateFindDate);

    let updateFindDebit = findTransactionsTypeForThisLoop.map((obj) => {
      return {
        Debit: obj.Gross_Proceed,
      };
    });

    let stringDebit = JSON.stringify(updateFindDebit);

    let updateFindCredit = findTransactionsTypeForThisLoop.map((obj) => {
      return {
        Credit: obj.Gross_Proceed,
      };
    });

    let stringCredit = JSON.stringify(updateFindCredit);

    let updateFindid = findTransactionsTypeForThisLoop.map((obj) => {
      return {
        CryptoDBid: obj.id,
      };
    });

    let stringID = JSON.stringify(updateFindid);

    let updateFindDuration = findTransactionsTypeForThisLoop.map((obj) => {
      return {
        Duration: obj.Duration,
      };
    });

    let stringDuration = JSON.stringify(updateFindDuration);

    let updateFindToCreditJEdata = findTransactionsTypeForThisLoop.map(
      (obj) => {
        return {
          Entity: obj.Account_Ownership,
          Wallet: obj.Account,
          Counterparty: obj.Counterparty,
          Asset: obj.Price_Symbol,
          Proceed_Date: obj.Proceed_Date,
          Ledger_Type1: elementJeCoding.Cledger,
          Ledger_Type2: elementJeCoding.CLedger_SType,
          Ledger_Name: obj.Transaction_Type,
          Debit: obj.Gross_Proceed,
          Credit: obj.Gross_Proceed,
          CryptoDBid: obj.id,
          Duration: obj.Duration,
        };
      }
    );

    const createAllDebit = await prisma.accountingJE.createMany({
      data: {
        Entity: stringEntity,
        Wallet: stringWallet,
        Counterparty: stringCounter,
        Asset: stringAsset,
        Proceed_Date: stringDate,
        Ledger_Type1: debitLedgerType,
        Ledger_Type2: debitLedger,
        Ledger_Name: transType,
        Debit: 1,
        Duration: stringDuration,
        CryptoDBid: 1,
      },
    });

    // const createAllCredit = await prisma.accountingJE.createMany({
    //   data:updateFindToCreditJEdata
    // })

    //   const createAllDebit = await prisma.accountingJE.create({
    //     data: {
    //       Entity: createJELineElement?.Account_Ownership,
    //       Wallet: createJELineElement?.Account,
    //       Counterparty: createJELineElement?.Counterparty,
    //       Asset: createJELineElement.Asset,
    //       Proceed_Date: createJELineElement?.Proceed_Date,
    //       Ledger_Type1: debitLedgerType,
    //       Ledger_Type2: debitLedger,
    //       Ledger_Name: createJELineElement.Transaction_Type,
    //       Debit: createJELineElement?.Gross_Proceed,
    //       Duration: createJELineElement?.Duration,
    //       hive: {
    //         connect: {
    //           id: createJELineElement?.id,
    //         },
    //       },
    //     },
    //   });

    //   const createAllCredit = await prisma.accountingJE.create({
    //     data: {
    //       Entity: createJELineElement?.Account_Ownership,
    //       Wallet: createJELineElement?.Account,
    //       Counterparty: createJELineElement?.Counterparty,
    //       Asset: createJELineElement.Price_Symbol,
    //       Proceed_Date: createJELineElement?.Proceed_Date,
    //       Ledger_Type1: creditLedgerType,
    //       Ledger_Type2: creditLedger,
    //       Ledger_Name: createJELineElement.Transaction_Type,
    //       Credit: createJELineElement?.Gross_Proceed,
    //       Duration: createJELineElement?.Duration,
    //       hive: {
    //         connect: {
    //           id: createJELineElement?.id,
    //         },
    //       },
    //     },
    //   });

    // // if you want to see your script running on a larger data set
    // console.log(elementJeCoding.Transaction_Type, " process completed");
  }
}

////----end of  producerReward function---------------------------------------

producerReward()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect;
  });
