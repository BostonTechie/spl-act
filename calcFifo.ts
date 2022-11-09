import prisma from "./prisma/client";

/// run order 1
async function createDistinctTables() {
  //this function creates a table of SPL accounts that can be iterated over when trying to calculate Fifo, it also creates a table of distinct tokens

  const distinctAccounts = await prisma.sPL.findMany({
    select: {
      Account: true,
    },
    distinct: ["Account"],
  });

  const createAccountsTable = await prisma.listing_Account.createMany({
    data: distinctAccounts,
  });

  const distinctTokens = await prisma.sPL.findMany({
    select: {
      Token: true,
    },
    distinct: ["Token"],
  });

  const createTokenTable = await prisma.listing_Token.createMany({
    data: distinctTokens,
  });

  console.log(
    "unique accounts,",
    createAccountsTable,
    " unique tokens ",
    createTokenTable
  );
}
////----end of function------------------------------------------------

/// run order 2 run after earlier sequence completes
async function sumOfBuyfromAccounts() {
  const findAllAccounts = await prisma.listing_Account.findMany({
    select: {
      Account: true,
    },
  });

  const findAllTokens = await prisma.listing_Token.findMany({
    select: {
      Token: true,
    },
  });

  for (let accountName of findAllAccounts) {
    // const calcSumOfBuyfromAccountsTokenandWallet = await prisma.sPL.findMany({
    //   where: {
    //     Token: "DEC",
    //     Account: accountName[0],
    //     Buy: "Buy",
    //   },
    //   select: {
    //     id: true,
    //     Created_Date: true,
    //     Amount: true,
    //   },
    // });
    console.log(accountName);
  }

  // let idAmount = 0;
  // let currentSumAmount = 0;
  // let previousSumAmount = 0;

  // for (const uniqueID of calcSumOfBuyfromAccountsTokenandWallet) {
  //   previousSumAmount = currentSumAmount;
  //   currentSumAmount = currentSumAmount + uniqueID.Amount;

  //   const update = await prisma.sPL.update({
  //     where: {
  //       id: uniqueID.id,
  //     },
  //     data: {
  //       Cumulative_Buy: currentSumAmount,
  //     },
  //   });
  // }
}
////----end of function------------------------------------------------

sumOfBuyfromAccounts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect;
  });

// createDistinctTables()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(() => {
//     prisma.$disconnect;
//   });
