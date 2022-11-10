import prisma from "../prisma/client";
import { mainPrompt } from "../calcprompts";
const { NumberPrompt } = require("enquirer");

//controls the scripting in this page "columnCalc"
export async function columnCalcsFunc() {
  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter a number",
  });

  console.log("Please enter one of the following options");
  console.log("0...Update the Buy/Sell Column");
  console.log("1...Update the Internal / External Column");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      updateBuySellColumn();
    }
    if (answer === 1) {
      updateBuySellColumn();
    }
    if (answer === 9) {
      mainPrompt();
    } else console.clear();
    console.log("🚨🚨🚨 invalid entry");
    columnCalcsFunc();
  });
}

//updates the buy or sell column in the SPL database for FIFO calc purposes in === Buy out === Sell
export async function updateBuySellColumn() {
  console.log("🌟🌟🌟 starting buy/sell script");
  await prisma.sPL.updateMany({
    where: {
      Amount: {
        gt: 0,
      },
    },
    data: {
      Buy_or_Sell: "Buy",
    },
  });

  await prisma.sPL.updateMany({
    where: {
      Amount: {
        lte: 0,
      },
    },
    data: {
      Buy_or_Sell: "Sell",
    },
  });
  console.log("👍👍👍 buy/sell column complete");
}

//updates the internal/external column in the SPL database for FIFO calc purposes if the to / from column === (any account name) in account column, then it is an internal transaction otherwise external
export async function internalExternalColumn() {
  const findInternalTransactions = await prisma.listing_Account.findMany({
    select: {
      Account: true,
    },
  });

  for (let element of findInternalTransactions) {
    await prisma.sPL.updateMany({
      where: {
        From: element.Account,
      },
      data: {
        Internal_or_External: "Internal",
      },
    });
  }

  await prisma.sPL.updateMany({
    where: {
      NOT: {
        Internal_or_External: "Internal",
      },
    },
    data: {
      Internal_or_External: "External",
    },
  });
}
