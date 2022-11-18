import prisma from "../prisma/client";
const { NumberPrompt, Confirm } = require("enquirer");
import { mainPrompt } from "../mainPrompts";

export function JsonPrompt() {
  //controls the console prompting in this page
  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter the number for your selection",
  });

  console.log("Please enter one of the following options");
  console.log("0...calc FIFO ");
  console.log("1...");
  console.log("2...");
  console.log("3...");
  console.log("4... ");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      answer = null;
      calcFifoJson();
    }
    if (answer === 1) {
      answer = null;
    }
    if (answer === 2) {
      answer = null;
    }
    if (answer === 3) {
      answer = null;
    }
    if (answer === 4) {
    }
    if (answer === 9) {
      mainPrompt();
    }
  });
}

async function calcFifoJson() {
  console.log("🌟🌟🌟 starting calc of of Fifo storing in json");
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
    get all unique tokens to loop
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
        orderBy: {
          id: "asc",
        },
        where: {
          Token: TokenName.Token,
          Account: accountName.Account,
        },
        select: {
          id: true,
          Token: true,
          Amount: true,
          Created_Date: true,
          Account: true,
          Price: true,
          inUSD: true,
          Internal_or_External: true,
        },
        take: ,
      });

      let currentSumAmount = 0;
      let previousSumAmount = 0;

      /* 
          store the previous sum amount
          add in the amount from the current buy record
          in the DB
        */
   
    }
  }


}
