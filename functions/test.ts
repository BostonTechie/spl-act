import prisma from "../prisma/client";
const { NumberPrompt, Confirm } = require("enquirer");
import { mainPrompt } from "../mainPrompts";
import { Prisma } from "@prisma/client";
import { stringify } from "querystring";

export declare type JsonValue = string | number | boolean | null;

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

  // for (let accountName of findAllAccounts) {
  //   for (let TokenName of findAllTokens) {
  //     let getJson = await prisma.sPL.findMany({
  //       orderBy: {
  //         id: "asc",
  //       },
  //       where: {
  //         Token: TokenName.Token,
  //         Account: accountName.Account,
  //       },
  //       select: {
  //         id: true,
  //         Token: true,
  //         Amount: true,
  //         Created_Date: true,
  //         Account: true,
  //         Price: true,
  //         inUSD: true,
  //         Internal_or_External: true,
  //       },
  //       take: 1,
  //     });

  //     let currentSumAmount = 0;
  //     let previousSumAmount = 0;

  //     /*
  //         store the previous sum amount
  //         add in the amount from the current buy record
  //         in the DB
  //       */
  //   }
  // }

  let getJson = await prisma.sPL.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      Token: "DEC",
      Account: "djsona",
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
    take: 1,
  });

  let json2 = getJson as unknown as Prisma.JsonArray;

  await prisma.sPL.update({
    where: {
      id: 2,
    },
    data: {
      Fifo: json2,
    },
  });

  /* 
   Test case where I perform math on a single 
   Json object that I fetched
  */

  // let logthis = await prisma.sPL.findUnique({
  //   where: {
  //     id: 1,
  //   },
  //   select: {
  //     Fifo: true,
  //   },
  // });

  // let math = JSON.parse(logthis.Fifo[0].Amount) + 1000;

  // console.log(logthis.Fifo[0].Amount, " ", math);

  /* 
    what happens when I fetch a JSON
    with multiple values or levels 
    in it?
  */

  let multipleJson = await prisma.sPL.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      id: {
        in: [1, 2],
      },
    },
    select: {
      Fifo: true,
    },
  });
  console.log(multipleJson[1]);
}
