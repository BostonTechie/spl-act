import prisma from "./prisma/client";
const { Confirm } = require("enquirer");
import { deleteTokenTable, deleteAccountTable } from "./functions/deleteTable";

async function main() {
  // const distinctAccounts = await prisma.sPL.findMany({
  //   select: {
  //     Account: true,
  //   },
  //   distinct: ["Account"],
  // });
  // // const createAccountsTable = await prisma.listing_Account.createMany({
  // //   data: distinctAccounts,
  // // });
  // // const distinctTokens = await prisma.sPL.findMany({
  // //   select: {
  // //     Token: true,
  // //   },
  // //   distinct: ["Token"],
  // // });
  // // const createTokenTable = await prisma.listing_Token.createMany({
  // //   data: distinctTokens,
  // // });
  // // console.log(
  // //   "unique accounts,",
  // //   createAccountsTable,
  // //   " unique tokens ",
  // //   createTokenTable
  // // );
  // // Calculate the USD equivalent price of the token, must be run after calcDeclookup, calcSPSlookup.
  // const calcUSD = await prisma.sPL.findMany({
  //   select: {
  //     id: true,
  //     Amount: true,
  //     Price: true,
  //   },
  // });
  // let usdOfElement = 0;
  // for (let element of calcUSD) {
  //   usdOfElement = element.Amount * element.Price;
  //   await prisma.sPL.update({
  //     where: {
  //       id: element.id,
  //     },
  //     data: {
  //       inUSD: usdOfElement,
  //     },
  //   });
  // }
  // console.log("calculate of USD complete");
  // const findInternalTransactions = await prisma.listing_Account.findMany({
  //   select: {
  //     Account: true,
  //   },
  // });
  // for (let element of findInternalTransactions) {
  //   await prisma.sPL.updateMany({
  //     where: {
  //       From: element.Account,
  //     },
  //     data: {
  //       Internal_or_External: "Internal",
  //     },
  //   });
  // }
  // await prisma.sPL.updateMany({
  //   where: {
  //     NOT: {
  //       Internal_or_External: "Internal",
  //     },
  //   },
  //   data: {
  //     Internal_or_External: "External",
  //   },
  // });
}
////----end of main function---------------------------------------

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect;
  });
