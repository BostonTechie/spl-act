const { NumberPrompt } = require("enquirer");
import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";
import { mainPrompt } from "../mainPrompts";
import {
  findSplIdsFunc,
  findAllAccountsFunc,
  findAllTokensFunc,
} from "../functions/findFunctions";

/* 
  Global variables
*/
let promiseAccountsGlobal = findAllAccountsFunc();
let promiseTokensGlobal = findAllTokensFunc();

export function realizedPrompt() {
  //controls the console prompting in this page
  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter the number for your selection",
  });

  console.log("Please enter one of the following options");
  console.log("0...calc realized ");
  console.log("1...");
  console.log("2...");
  console.log("3...");
  console.log("4... ");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      answer = null;
      countBigvSmallTrans().catch((e) => {
        console.error(e);
        process.exit(1);
      });
    }
    if (answer === 1) {
      answer = null;
    }

    if (answer === 2) {
      answer = null;
    }

    if (answer === 9) {
      mainPrompt();
    }
  });
}

async function countBigvSmallTrans() {
  /* 
     Find the count of all Account,
     Token combinations not have at least
     one value, break those into large, versus
     small types
    */

  let findAllAccounts = await promiseAccountsGlobal;
  let findAllTokens = await promiseTokensGlobal;

  let smallI = 0;
  let bigI = 0;

  for (let account of findAllAccounts) {
    for (let token of findAllTokens) {
      let countTrans = await prisma.sPL.count({
        where: {
          Token: token.Token,
          Account: account.Account,
        },
      });

      splitBivSmallTRans(countTrans, smallI, bigI, account, token);
      smallI++;
      bigI++;

      if (bigI === 5) {
        // reset i to send to specific function
        bigI = 0;
      }
      if (smallI === 5) {
        // reset i to send to specific function
        smallI = 0;
      }
    }
  }
}

async function splitBivSmallTRans(countTrans, smallI, bigI, account, token) {
  if (countTrans != 0) {
    if (countTrans >= 250000) {
      let largeTObject = {
        bigI: bigI,
        count: countTrans,
        account: account.Account,
        token: token.Token,
      };

      if (bigI === 0) {
        bRealizedFunc1(largeTObject);
      }
      if (bigI === 1) {
        bRealizedFunc2(largeTObject);
      }
      if (bigI === 2) {
        bRealizedFunc3(largeTObject);
      }
      if (bigI === 3) {
        bRealizedFunc4(largeTObject);
      }
      if (bigI === 4) {
        bRealizedFunc5(largeTObject);
      }
      bigI++;
    } else {
      let smallTObject = {
        smallI: smallI,
        count: countTrans,
        account: account.Account,
        token: token.Token,
      };

      if (smallI === 0) {
        sRealizedFunc1(smallTObject);
      }
      if (smallI === 1) {
        sRealizedFunc2(smallTObject);
      }
      if (smallI === 2) {
        sRealizedFunc3(smallTObject);
      }
      if (smallI === 3) {
        sRealizedFunc4(smallTObject);
      }
      if (smallI === 4) {
        sRealizedFunc5(smallTObject);
      }
      smallI++;
    }
  }
}

async function bRealizedFunc1(largeTObject) {
  console.log("i am big func 1", largeTObject);
}

async function bRealizedFunc2(largeTObject) {
  console.log("i am big func 2", largeTObject);
}
async function bRealizedFunc3(largeTObject) {
  console.log("i am big func 3", largeTObject);
}
async function bRealizedFunc4(largeTObject) {
  console.log("i am big func 4", largeTObject);
}
async function bRealizedFunc5(largeTObject) {
  console.log("i am big func 5", largeTObject);
}

async function sRealizedFunc1(smallTObject) {
  console.log("i am small func 1", smallTObject.account, smallTObject.token);

  let createFifoJson = await prisma.sPL.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      Token: smallTObject.token,
      Account: smallTObject.account,
    },
    select: {
      id: true,
    },
  });

  console.log(createFifoJson);
  //       // i used in for loop below
  //       let i = 0;
  //       for (let uniqueID of createFifoJson) {
  //         /*
  //               Creates a JSON to store the Original
  //               values of a Buy to be used by FIFO
  //             */
  //         let jsonUpdateCol = [
  //           {
  //             id: uniqueID.id,
  //             Token: uniqueID.Token,
  //             Amount: uniqueID.Amount,
  //             Original_Amount: uniqueID.Amount,
  //             Remaining_Amount: uniqueID.Amount,
  //             Created_Date: uniqueID.Created_Date,
  //             Account: uniqueID.Account,
  //             Original_Price: uniqueID.Price,
  //             Price: uniqueID.Price,
  //             inUSD: uniqueID.inUSD,
  //             Buy_or_Sell: uniqueID.Buy_or_Sell,
  //             Original_Type: uniqueID.Buy_or_Sell,
  //             Internal_or_External: uniqueID.Internal_or_External,
  //           },
  //         ] as unknown as Prisma.JsonObject;
  //         let getZeroArray = jsonUpdateCol[0];
  //         /*
  //               create an array to use as filter later
  //               in this function to loop through
  //             */
  //         if (i === 0) {
  //           createdIdArrayFirstFifoLevel.push(uniqueID.id);
  //           /*
  //                   Fifo must always start
  //                   at the very first transaction
  //                   and roll from there, in theroy
  //                   that transaction would always be
  //                   a buy
  //                 */
  //           await prisma.fifo.upsert({
  //             where: {
  //               id: uniqueID.id,
  //             },
  //             update: {
  //               Fifo: getZeroArray,
  //               Buy_or_Sell: uniqueID.Buy_or_Sell,
  //               LevelFifo: getZeroArray,
  //               SPL: {
  //                 connect: {
  //                   id: uniqueID.id,
  //                 },
  //               },
  //             },
  //             create: {
  //               Fifo: getZeroArray,
  //               Buy_or_Sell: uniqueID.Buy_or_Sell,
  //               LevelFifo: getZeroArray,
  //               SPL: {
  //                 connect: {
  //                   id: uniqueID.id,
  //                 },
  //               },
  //             },
  //           });
  //           i++;
  //         }
  //         /*
  //               Create or update the
  //               Fifo column which just stores a
  //               frozen value
  //             */
  //         if (i != 0) {
  //           await prisma.fifo.upsert({
  //             where: {
  //               id: uniqueID.id,
  //             },
  //             update: {
  //               Buy_or_Sell: uniqueID.Buy_or_Sell,
  //               Fifo: getZeroArray,
  //               SPL: {
  //                 connect: {
  //                   id: uniqueID.id,
  //                 },
  //               },
  //             },
  //             create: {
  //               Buy_or_Sell: uniqueID.Buy_or_Sell,
  //               Fifo: getZeroArray,
  //               SPL: {
  //                 connect: {
  //                   id: uniqueID.id,
  //                 },
  //               },
  //             },
  //           });
  //         }
  //       }
}

async function sRealizedFunc2(smallTObject) {
  console.log("i am small func 2", smallTObject);
}

async function sRealizedFunc3(smallTObject) {
  console.log("i am small func 3", smallTObject);
}

async function sRealizedFunc4(smallTObject) {
  console.log("i am small func 4", smallTObject);
}

async function sRealizedFunc5(smallTObject) {
  console.log("i am small func 5", smallTObject);
}
