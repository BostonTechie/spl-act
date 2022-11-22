import prisma from "../prisma/client";
const { NumberPrompt, Confirm } = require("enquirer");
import { mainPrompt } from "../mainPrompts";
import { Prisma } from "@prisma/client";

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
      // cumBuy();
      // cumSell();
      fifoUpdateColumn();
      //calcFifoColumns();
    }
    // if (answer === 1) {
    //   answer = null;
    //   cumBuy();
    // }
    // if (answer === 2) {
    //   answer = null;
    //   cumSell();
    // }
    // if (answer === 3) {
    //   answer = null;
    //   rxBalance();
    // }
    // if (answer === 4) {
    // }
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
    get all unique Tokens to loop
    through later in the function
  */
  const findAllTokens = await prisma.listing_Token.findMany({
    select: {
      Token: true,
    },
  });

  /* 
    Loop through all of the Token names buy 
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
    get all uniquey Tokens to loop
    through later in the function
  */
  const findAllTokens = await prisma.listing_Token.findMany({
    select: {
      Token: true,
    },
  });

  /* 
    Loop through all of the Token names buy 
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
    get all unique Tokens to loop
    through later in the function
  */
  const findAllTokens = await prisma.listing_Token.findMany({
    select: {
      Token: true,
    },
  });

  /* 
    Loop through all of the Token names buy 
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
    get all uniquey Tokens to loop
    through later in the function
  */
  const findAllTokens = await prisma.listing_Token.findMany({
    select: {
      Token: true,
    },
  });

  /* 
    Loop through all of the Token names buy 
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
    get all unique Tokens to loop
    through later in the function
  */
  const findAllTokens = await prisma.listing_Token.findMany({
    select: {
      Token: true,
    },
  });

  /* 
    Loop through all of the Token names buy 
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

async function fifoUpdateColumn() {
  /* 
    In this function I call all the data
    in order of date from Oldest to youngest
    I put all of that data into a JSON
    as the function rolls through time it calcs the
    realized gains for any Sell based on the first
    item (FIFO) queued in the JSON array,
    every new buy adds a new "level" to the que of FIFO
    JSON array
  */

  console.log("🌟🌟🌟 Updating FiFo column");
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
    get all unique Tokens to loop
    through later in the function
  */
  const findAllTokens = await prisma.listing_Token.findMany({
    select: {
      Token: true,
    },
  });

  /* 
    Created Id Array is an an Array
    to store the unique id every time
    the logic gets onto a new Token within
    a new account. Every time this new situation 
    occurs, by definition that should be the first 
    level of FIFO, assuming  your data is 
    organized by date ascending
  */
  let createdIdArrayFirstFifoLevel = [];
  for (let accountName of findAllAccounts) {
    for (let TokenName of findAllTokens) {
      let createFifoJson = await prisma.sPL.findMany({
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
          Buy_or_Sell: true,
          Internal_or_External: true,
        },
        // take: 1,
      });

      // i used in for loop below
      let i = 0;

      for (let uniqueID of createFifoJson) {
        /* 
          Creates a JSON to store the Original
          values of a Buy to be used by FIFO
        */

        let jsonUpdateCol = [
          {
            id: uniqueID.id,
            Token: uniqueID.Token,
            Amount: uniqueID.Amount,
            Original_Amount: uniqueID.Amount,
            Consumed_Amount: 0,
            Remaining_Amount: uniqueID.Amount,
            Created_Date: uniqueID.Created_Date,
            Account: uniqueID.Account,
            Price: uniqueID.Price,
            inUSD: uniqueID.inUSD,
            Buy_or_Sell: uniqueID.Buy_or_Sell,
            Internal_or_External: uniqueID.Internal_or_External,
          },
        ] as unknown as Prisma.JsonObject;

        let getZeroArray = jsonUpdateCol[0];
        /* 
          create an array to use as filter later 
          in this function to loop through
        */

        if (i === 0) {
          createdIdArrayFirstFifoLevel.push(uniqueID.id);

          /* 
              Fifo must always start
              at the very first transaction
              and roll from there, in theroy
              that transaction would always be
              a buy
            */

          await prisma.fifo.upsert({
            where: {
              id: uniqueID.id,
            },
            update: {
              Fifo: getZeroArray,
              LevelFifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
            create: {
              Fifo: getZeroArray,
              LevelFifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
          });
          i++;
        }
        /* 
          Create or update the 
          Fifo column which just stores a
          frozen value
        */
        if (i != 0) {
          await prisma.fifo.upsert({
            where: {
              id: uniqueID.id,
            },
            update: {
              Fifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
            create: {
              Fifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
          });
        }
      }
    }
  }
  calcFifoColumns(createdIdArrayFirstFifoLevel);
}

async function calcFifoColumns(createdIdArrayFirstFifoLevel) {
  /* 
    In this function I call all the data
    in order of date from Oldest to youngest
    I put all of that data into a JSON
    as the function rolls through time it calcs the
    realized gains for any Sell based on the first
    item (FIFO) queued in the JSON array,
    every new  buy adds a new "level" to the que of FIFO
    JSON array  
  */

  let findFifoTransaction = await prisma.fifo.findMany({
    /* 
      Grab all the unique transactions
      that are not the first level
       of the FIFO functions
    */
    orderBy: {
      id: "asc",
    },
    where: {
      NOT: {
        id: {
          in: createdIdArrayFirstFifoLevel,
        },
      },
    },
    select: {
      id: true,
      Fifo: true,
      LevelFifo: true,
    },
    take: 1,
  });

  for (let thisRowofFifo of findFifoTransaction) {
    /* 
    Data Structure:
    {
      id: 2,
      Fifo: {
        id: 2,
        Price: '0.000921',
        Token: 'DEC',
        inUSD: '-0.015054',
        Amount: '-16.345',
        Account: 'Aggroed',
        Buy_or_Sell: 'Sell',
        Created_Date: '2020-10-24T00:00:00.000Z',
        Internal_or_External: 'External'
      }
    } 
   */

    if (thisRowofFifo.Fifo["Buy_or_Sell"] === "Sell") {
      /* 
        When you grab the current sell trans
        you have to then grab the level of FIFO
        that is currently being consumed i.e. the id of 
        LevelFifo (column in DB) - 1
      */
      let prevId = Number(thisRowofFifo.Fifo["id"]) - 1;

      let prevLevel = await prisma.fifo.findUnique({
        where: {
          id: prevId,
        },
        select: {
          LevelFifo: true,
        },
      });

      /* 
        Define the got variables 
        as Typescript numbers
      */

      let currentSellAmount = Number(thisRowofFifo.Fifo["Amount"]);
      let currentPrice = Number(thisRowofFifo.Fifo["Price"]);
      let LevelFifoAmount = Number(prevLevel.LevelFifo["Remaining_Amount"]);
      let LevelFifoPrice = Number(prevLevel.LevelFifo["Price"]);
      let amountNotLessThanZero =
        Number(LevelFifoAmount) + Number(currentSellAmount);
      let costBasis = 0;

      if (amountNotLessThanZero > 0) {
        /* 
              calcualte realized gain/ loss in the case that
              the sell doesn't fully consume the FIFO level
            */
        costBasis = currentSellAmount * LevelFifoPrice;
        let soldInUSD = currentPrice * currentSellAmount;
        let calcRealized = soldInUSD - costBasis;

        await prisma.fifo.upsert({
          where: {
            id: thisRowofFifo.id,
          },
          update: {
            Realized: calcRealized,
            LevelFifo: {
              id: prevLevel.LevelFifo["id"],
              Price: prevLevel.LevelFifo["Price"],
              Token: prevLevel.LevelFifo["Token"],
              inUSD: prevLevel.LevelFifo["inUSD"],
              Original_Amount: prevLevel.LevelFifo["Amount"],
              Consumed_Amount: thisRowofFifo.Fifo["Amount"],
              Remaining_Amount: amountNotLessThanZero,
              Account: prevLevel.LevelFifo["Account"],
              Buy_or_Sell: prevLevel.LevelFifo["Buy_or_Sell"],
              Created_Date: prevLevel.LevelFifo["Created_Date"],
              Internal_or_External: prevLevel.LevelFifo["Internal_or_External"],
            },
          },
          create: {
            Realized: calcRealized,
            LevelFifo: {
              id: prevLevel.LevelFifo["id"],
              Price: prevLevel.LevelFifo["Price"],
              Token: prevLevel.LevelFifo["Token"],
              inUSD: prevLevel.LevelFifo["inUSD"],
              Original_Amount: prevLevel.LevelFifo["Amount"],
              Consumed_Amount: thisRowofFifo.Fifo["Amount"],
              Remaining_Amount: amountNotLessThanZero,
              Account: prevLevel.LevelFifo["Account"],
              Buy_or_Sell: prevLevel.LevelFifo["Buy_or_Sell"],
              Created_Date: prevLevel.LevelFifo["Created_Date"],
              Internal_or_External: prevLevel.LevelFifo["Internal_or_External"],
            },
          },
        });
      }
    }
  }
}
