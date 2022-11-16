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
  console.log("1...calc cummulative sell + previous cummulative sell'");
  console.log("2... ");
  console.log("3... '");
  console.log("4... ");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      answer = null;
      sumOfBuyfromAccounts();
      sumOfPreviousBuyfromAccounts();
    }
    if (answer === 1) {
      answer = null;
      sumOfSellfromAccounts();
      sumOfPreviousSellfromAccounts();
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
          Buy_or_Sell: "Buy",
        },
        select: {
          id: true,
          Created_Date: true,
          Amount: true,
        },
        // take: 2,
      });

      let currentSumAmount = 0;
      let previousSumAmount = 0;

      /* 
        store the previous sum amount
        add in the amount from the current buy record
        in the DB
      */
      for (let uniqueID of sumOfBuyfromWallet) {
        previousSumAmount = currentSumAmount;
        currentSumAmount = Number(currentSumAmount) + Number(uniqueID.Amount);

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
}

async function sumOfPreviousBuyfromAccounts() {
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
      let previousBuy = 0;

      let sumOfBuyfromWallet = await prisma.sPL.findMany({
        orderBy: {
          id: "asc",
        },
        where: {
          Token: TokenName.Token,
          Account: accountName.Account,
          Buy_or_Sell: "Buy",
        },
        select: {
          id: true,
          Created_Date: true,
          Amount: true,
          Cumulative_Buy: true,
        },
        // take: 2,
      });

      /* 
        store the previous sum amount
        add in the amount from the current buy record
        in the DB
      */
      for (let uniqueID of sumOfBuyfromWallet) {
        await prisma.sPL.update({
          where: {
            id: uniqueID.id,
          },
          data: {
            Prev_Cumulative_Buy: previousBuy,
          },
        });
        previousBuy = Number(uniqueID.Cumulative_Buy);
      }
    }
  }
  console.log("👍👍👍 cummulative sum complete");
}

async function sumOfSellfromAccounts() {
  console.log("🌟🌟🌟 starting calc of cumulative sell");
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
      let sumOfSellfromWallet = await prisma.sPL.findMany({
        /* 
          Might need to order on something 
          other than ID, Date would be preferable 
          if Postgres can sucessfully import 
          seconds/ milliseconds
        */
        orderBy: {
          id: "asc",
        },
        where: {
          Token: TokenName.Token,
          Account: accountName.Account,
          Buy_or_Sell: "Sell",
        },
        select: {
          id: true,
          Created_Date: true,
          Amount: true,
        },
        take: 2,
      });

      let currentSumAmount = 0;
      let previousSumAmount = 0;

      /* 
        store the previous sum amount
        add in the amount from the current buy record
        in the DB
      */
      for (let uniqueID of sumOfSellfromWallet) {
        /* 
          Update previous sum to equal current sum
          then update current sum to equal
          curent sum plus amount in this row in 
          table Spl Column amount
        */
        previousSumAmount = currentSumAmount;
        currentSumAmount = Number(currentSumAmount) + Number(uniqueID.Amount);

        await prisma.sPL.update({
          where: {
            id: uniqueID.id,
          },
          data: {
            Cumulative_Sell: currentSumAmount,
          },
        });
      }
    }
  }
}

async function sumOfPreviousSellfromAccounts() {
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
      let previousSell = 0;
      /* 
       Might need to order on something 
       other than ID, Date would be preferable 
       if Postgres can sucessfully import 
       seconds/ milliseconds
      */
      let sumOfSellfromWallet = await prisma.sPL.findMany({
        orderBy: {
          id: "asc",
        },
        where: {
          Token: TokenName.Token,
          Account: accountName.Account,
          Buy_or_Sell: "Sell",
        },
        select: {
          id: true,
          Created_Date: true,
          Amount: true,
          Cumulative_Sell: true,
        },
        take: 2,
      });

      /* 
        store the previous sum amount
        add in the amount from the current sell record
        in the DB
      */
      for (let uniqueID of sumOfSellfromWallet) {
        await prisma.sPL.update({
          where: {
            id: uniqueID.id,
          },
          data: {
            Prev_Cumulative_Sell: previousSell,
          },
        });
        previousSell = Number(uniqueID.Cumulative_Sell);
      }
    }
  }
  console.log("👍👍👍 cummulative sell complete");
}
