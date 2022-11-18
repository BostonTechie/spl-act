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
  console.log("0...calc FIFO ");
  console.log("1...calc cumulative sell + previous cumulative sell");
  console.log("2...calc cumulative sell + previous cumulative sell");
  console.log("3...RX the balance '");
  console.log("4... ");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      answer = null;
      cumBuy();
      cumSell();
    }
    if (answer === 1) {
      answer = null;
      cumBuy();
    }
    if (answer === 2) {
      answer = null;
      cumSell();
    }
    if (answer === 3) {
      answer = null;
      rxBalance();
    }
    if (answer === 4) {
    }
    if (answer === 9) {
      mainPrompt();
    }
  });
}

async function cumBuy() {
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

  /* 
    run script to pop
    previous buy column,
    which must be run after the cumlative
    column is calculated
 */
  prevCumBuy();
}

async function prevCumBuy() {
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
  console.log("👍👍👍 cumulative sum complete");
  fifoPrompt();
}

async function cumSell() {
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
      let rxTheImportedBalance = await prisma.sPL.findMany({
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
        //take: 2,
      });

      let currentSumAmount = 0;
      let previousSumAmount = 0;

      /* 
        store the previous sum amount
        add in the amount from the current buy record
        in the DB
      */
      for (let uniqueID of rxTheImportedBalance) {
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
  /* 
  run script to pop
  previous buy column,
  which must be run after the cumlative
  column is calculated
*/
  prevCumSell();
}

async function prevCumSell() {
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
      let rxTheImportedBalance = await prisma.sPL.findMany({
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
        // take: 2,
      });

      /* 
        store the previous sum amount
        add in the amount from the current sell record
        in the DB
      */
      for (let uniqueID of rxTheImportedBalance) {
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
  console.log("👍👍👍 cumulative sell complete");
  fifoPrompt();
}

async function rxBalance() {
  console.log("🌟🌟🌟 starting calc of RXBalance");
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
    Balance, to ensure data intergrity
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
            BalanceRX: currentSumAmount,
          },
        });
      }
    }
  }
  console.log("👍👍👍 Completed calc of RXBalance");
}

async function realizedColumn() {
  /* 
  
  */

  console.log("🌟🌟🌟 starting calc of realized Gains / losses");
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
    Balance, to ensure data intergrity
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
            BalanceRX: currentSumAmount,
          },
        });
      }
    }
  }
  console.log("👍👍👍 Completed calc of RXBalance");
}
