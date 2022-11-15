import prisma from "../prisma/client";
const { NumberPrompt, Confirm } = require("enquirer");
import { mainPrompt } from "../mainPrompts";

export function fifoPrompt() {
  //controls the console prompting in this page
  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter the number for your selection",
  });

  console.log("Please enter one of the following options");
  console.log("0...calc cummulative buy + previous cummulative buy ");
  console.log("1...Truncate distinct accounts.. table name: 'Listing_Account'");
  console.log("2... \u{1F36A} Truncate & rerun  'Listing_Token'Table ");
  console.log("3... \u{1F36A} Truncate & rerun  'Listing_Account'");
  console.log("4... List name of all tables in the DB");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      sumOfBuyfromAccounts();
    }
    if (answer === 1) {
    }
    if (answer === 2) {
    }
    if (answer === 3) {
    }
    if (answer === 4) {
    }
    if (answer === 9) {
      mainPrompt();
    }
  });
}

async function sumOfBuyfromAccounts() {
  console.log("🌟🌟🌟 starting calc of cumulative sum");
  /* 
     Grab all the unique accounts
     to loop thrugh later in function
    */

  const findAllAccounts = await prisma.listing_Account.findMany({
    select: {
      Account: true,
    },
  });

  /* 
    get all uniquey tokens to loop
    through later in the function
  */
  const findAllTokens = await prisma.listing_Token.findMany({
    select: {
      Token: true,
    },
  });

  /* 
    Loop through all of the token names buy 
    account and calculate the cumulative buy
    for Fifo purposes
  */

  for (let accountName of findAllAccounts) {
    for (let TokenName of findAllTokens) {
      let sumOfBuyfromWallet = await prisma.sPL.findMany({
        where: {
          Token: TokenName.Token,
          Account: accountName.Account,
          Buy_or_Sell: "Buy",
        },
        select: {
          id: true,
          Created_Date: true,
          Amount: true,
        },
        // take: 2,
      });

      let idAmount = 0;
      let currentSumAmount = 0;
      let previousSumAmount = 0;

      /* 
        store the previous sum amount
        add in the amount from the current buy record
        in the DB
      */
      for (let uniqueID of sumOfBuyfromWallet) {
        previousSumAmount = currentSumAmount;
        currentSumAmount = currentSumAmount + uniqueID.Amount;

        await prisma.sPL.update({
          where: {
            id: uniqueID.id,
          },
          data: {
            Cumulative_Buy: currentSumAmount,
          },
        });
      }
    }
  }
  console.log("👍👍👍 cummulative sum complete");
}
