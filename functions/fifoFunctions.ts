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
            Remaining_Amount: uniqueID.Amount,
            Created_Date: uniqueID.Created_Date,
            Account: uniqueID.Account,
            Original_Price: uniqueID.Price,
            Price: uniqueID.Price,
            inUSD: uniqueID.inUSD,
            Buy_or_Sell: uniqueID.Buy_or_Sell,
            Original_Type: uniqueID.Buy_or_Sell,
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
              Buy_or_Sell: uniqueID.Buy_or_Sell,
              LevelFifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
            create: {
              Fifo: getZeroArray,
              Buy_or_Sell: uniqueID.Buy_or_Sell,
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
              Buy_or_Sell: uniqueID.Buy_or_Sell,
              Fifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
            create: {
              Buy_or_Sell: uniqueID.Buy_or_Sell,
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
    // take: 5,
  });

  for (let thisRowofFifo of findFifoTransaction) {
    /* 
    Data Structure:
    {
      id: 2,
      Fifo: {
      "id": 1,
      "Price": "0",
      "Token": "DEC",
      "inUSD": "0",
      "Amount": "50914",
      "Account": "Aggroed",
      "Buy_or_Sell": "Buy",
      "Created_Date": "2020-06-11T00:00:00.000Z",
      "Original_Type": "Buy",
      "Original_Price": "0",
      "Original_Amount": "50914",
      "Remaining_Amount": "50914",
      "Internal_or_External": "External"
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
      let prevLevelFifoAmount = Number(prevLevel.LevelFifo["Remaining_Amount"]);
      let prevLevelFifoPrice = Number(prevLevel.LevelFifo["Original_Price"]);
      let amountNotLessThanZero =
        Number(prevLevelFifoAmount) + Number(currentSellAmount);
      let costBasis = 0;
      let accumulateRealized = 0;
      let leftToSell = 0;
      let maxRemainSell = Number(prevLevel.LevelFifo["Remaining_Amount"]);
      let multiSellArray = [];

      if (amountNotLessThanZero > 0) {
        /* 
              calcualte realized gain/ loss in the case that
              the sell doesn't fully consume the FIFO level
            */
        costBasis = currentSellAmount * prevLevelFifoPrice;
        let soldInUSD = currentPrice * currentSellAmount;
        let calcRealized = soldInUSD - costBasis;

        // console.log(
        //   `id: ${thisRowofFifo.Fifo["id"]}
        //   sell price: ${currentPrice}
        //   fifo Price: ${prevLevelFifoPrice}
        //   sell amount: ${currentSellAmount}
        //   Remaining Amount: ${amountNotLessThanZero}`
        // );

        await prisma.fifo.upsert({
          where: {
            id: thisRowofFifo.id,
          },
          update: {
            Realized: calcRealized,
            LevelFifo: {
              id: prevLevel.LevelFifo["id"],
              Original_Price: prevLevel.LevelFifo["Original_Price"],
              Price_Of_Current_Sale: thisRowofFifo.Fifo["Price"],
              Token: prevLevel.LevelFifo["Token"],
              inUSD: prevLevel.LevelFifo["inUSD"],
              Original_Amount: prevLevel.LevelFifo["Amount"],
              Consumed_Amount_For_This_Sale: thisRowofFifo.Fifo["Amount"],
              Remaining_Amount: amountNotLessThanZero,
              Account: prevLevel.LevelFifo["Account"],
              Original_Type: prevLevel.LevelFifo["Original_Type"],
              Row_Type: thisRowofFifo.Fifo["Buy_or_Sell"],
              FIFO_Date: prevLevel.LevelFifo["Created_Date"],
              Sale_Date: thisRowofFifo.Fifo["Date"],
              Internal_or_External: thisRowofFifo.Fifo["Internal_or_External"],
              Realized: calcRealized,
            },
          },
          create: {
            Realized: calcRealized,
            LevelFifo: {
              id: prevLevel.LevelFifo["id"],
              Original_Price: prevLevel.LevelFifo["Original_Price"],
              Price_Of_Current_Sale: thisRowofFifo.Fifo["Price"],
              Token: prevLevel.LevelFifo["Token"],
              inUSD: prevLevel.LevelFifo["inUSD"],
              Original_Amount: prevLevel.LevelFifo["Amount"],
              Consumed_Amount_For_This_Sale: thisRowofFifo.Fifo["Amount"],
              Remaining_Amount: amountNotLessThanZero,
              Account: prevLevel.LevelFifo["Account"],
              Original_Type: prevLevel.LevelFifo["Original_Type"],
              Row_Type: thisRowofFifo.Fifo["Buy_or_Sell"],
              FIFO_Date: prevLevel.LevelFifo["Created_Date"],
              Sale_Date: thisRowofFifo.Fifo["Date"],
              Internal_or_External: thisRowofFifo.Fifo["Internal_or_External"],
              Realized: calcRealized,
            },
          },
        });
      }

      if (amountNotLessThanZero < 0) {
        /* 
         This "if" statment controls the use
         case where a sell consumes at least one
         or more levels of the Remaining Fifo
        */
        let i = 0;
        while (i != 5) {
          //   /*
          //   in the case your sell
          //   consumes multiple levels of buys
          //   this script tracks what the total sell is
          //   versus the size of the buy in the givencle
          //   level of FIFO
          // */

          let nextBuyId = Number(prevLevel.LevelFifo["id"] + i);
          leftToSell = -currentSellAmount - maxRemainSell;

          /*
            calcualte realized gain/ loss in the case that
            the sell  consumes the current FIFO level
          */
          costBasis = maxRemainSell * prevLevelFifoPrice;
          let soldInUSD = currentPrice * maxRemainSell;
          let calcRealized = soldInUSD - costBasis;
          accumulateRealized = accumulateRealized + calcRealized;

          if (i === 0) {
            multiSellArray.push({
              id: nextBuyId,
              Original_Price: prevLevel.LevelFifo["Original_Price"],
              Price_Of_Current_Sale: thisRowofFifo.Fifo["Price"],
              Token: prevLevel.LevelFifo["Token"],
              inUSD: prevLevel.LevelFifo["inUSD"],
              Original_Amount: prevLevel.LevelFifo["Amount"],
              Consumed_Amount_For_This_Sale: maxRemainSell,
              Remaining_Amount: prevLevelFifoAmount - maxRemainSell,
              Account: prevLevel.LevelFifo["Account"],
              Original_Type: prevLevel.LevelFifo["Original_Type"],
              Row_Type: thisRowofFifo.Fifo["Buy_or_Sell"],
              FIFO_Date: prevLevel.LevelFifo["Created_Date"],
              Sale_Date: thisRowofFifo.Fifo["Created_Date"],
              Internal_or_External: thisRowofFifo.Fifo["Internal_or_External"],
              Realized: calcRealized,
            });
          }

          let nextBuy = await prisma.fifo.findFirst({
            orderBy: {
              id: "asc",
            },
            where: {
              id: {
                gt: nextBuyId,
              },
              Buy_or_Sell: "Buy",
            },
          });

          if (i > 0) {
            multiSellArray.push({
              id: nextBuyId,
              Original_Price: nextBuy.Fifo["Original_Price"],
              Price_Of_Current_Sale: thisRowofFifo.Fifo["Price"],
              Token: nextBuy.Fifo["Token"],
              inUSD: nextBuy.Fifo["inUSD"],
              Original_Amount: nextBuy.Fifo["Amount"],
              Consumed_Amount_For_This_Sale: maxRemainSell,
              Remaining_Amount: prevLevelFifoAmount - maxRemainSell,
              Account: nextBuy.Fifo["Account"],
              Original_Type: prevLevel.LevelFifo["Original_Type"],
              Row_Type: thisRowofFifo.Fifo["Buy_or_Sell"],
              FIFO_Date: nextBuy.Fifo["Created_Date"],
              Sale_Date: thisRowofFifo.Fifo["Created_Date"],
              Internal_or_External: thisRowofFifo.Fifo["Internal_or_External"],
              Realized: calcRealized,
            });
          }
          // console.log("multi sell array", multiSellArray);

          i++;

          console.log("next buy", nextBuy);
        }
      }
    }

    if (thisRowofFifo.Fifo["Buy_or_Sell"] === "Buy") {
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

      await prisma.fifo.upsert({
        where: {
          id: thisRowofFifo.id,
        },
        update: {
          Realized: 0.0,
          LevelFifo: prevLevel.LevelFifo,
        },
        create: {
          Realized: 0.0,
          LevelFifo: prevLevel.LevelFifo,
        },
      });
    }
  }
}
