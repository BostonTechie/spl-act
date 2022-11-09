import prisma from "./prisma/client";

/// run after calcUSD and after lookupprices
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
