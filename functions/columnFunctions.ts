import prisma from "../prisma/client";
const { NumberPrompt } = require("enquirer");
import { mainPrompt } from "../mainPrompts";

export function columnPrompt() {
  //controls the scripting in this page "columnCalc"
  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter the number for your selection",
  });

  console.log("Please enter one of the following options");
  console.log("0...Update the Buy/Sell Column");
  console.log("1...Update the Internal / External Column");
  console.log("2...Lookup DEC prices");
  console.log("3...Lookup SPS prices");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      updateBuySellColumn();
    }
    if (answer === 1) {
      internalExternalColumn();
    }
    if (answer === 2) {
      lookupDECPriceHistory();
    }
    if (answer === 9) {
      mainPrompt();
    }
  });
}

async function updateBuySellColumn() {
  //updates the buy or sell column in the SPL database for FIFO calc purposes in === Buy out === Sell
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
  columnPrompt();
}

async function internalExternalColumn() {
  //updates the internal/external column in the SPL database for FIFO calc purposes if the to / from column === (any account name) in account column, then it is an internal transaction otherwise external
  console.log("🌟🌟🌟 starting internal/external script");
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
  console.log("👍👍👍 internal/external column complete");
  columnPrompt();
}

async function lookupDECPriceHistory() {
  console.log("🌟🌟🌟 starting lookup of DEC prices");
  /*
    this function place the price of a token into the appropriate line 
    for a given Crypto transation on the SPL table,
    it looks up the Price from the
    "history_price_XXX" tables.
  */

  /*
   I have "crypto" data that begins before my historical data
    For DEC token i declare a fixed number later, based on the earilest date
    that I have data for (from yahoo) (8/10/2020)
 */

  let firstDecPrice = new Date(2020, 7, 10);

  /*
   i update the prices for all tranactions
   that I have no data for below, 
   this number or assumption could be wrong talk to Jesse 
  */

  await prisma.sPL.updateMany({
    where: {
      Token: "DEC",
      Created_Date: {
        lte: firstDecPrice,
      },
    },
    data: {
      Price: 0.000507,
    },
  });

  //this code section updates the prices for any date after the first price date.. Meaning A price exist and can be found online, before (8/10/2020) no data seems to exist
  const updateSPLwithFindPriceDEC = await prisma.sPL.findMany({
    where: {
      Token: "DEC",
      Created_Date: {
        gt: firstDecPrice,
      },
    },
    select: {
      id: true,
      Created_Date: true,
    },
    //if you want to run a smaller sample uncomment next line
    //take: 1,
  });

  for (let element of updateSPLwithFindPriceDEC) {
    let strmonth = "";
    let strDate = "";

    /*
     this if controls logic for findinf prices of the DEC
      token that I have found in yahoo finance, note all data is after
       (8/10/2020)
        https://finance.yahoo.com/quote/DEC1-USD/history?period1=1594598400&period2=1666051200&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true

      */

    let elementDate = element.Created_Date;
    let date = elementDate.getUTCDate();
    let month = elementDate.getUTCMonth();
    let year = elementDate.getUTCFullYear();
    month++;

    //handle the use case that day 1 - 9, needs to return 01 - 09
    if (month < 9) {
      strmonth = "0" + month.toString();
    }

    if (month === 9) {
      strmonth = "10";
    }

    if (month > 9) {
      strmonth = month.toString();
    }

    if (date > 9) {
      strDate = date.toString();
    }
    if (date < 10) {
      strDate = "0" + date.toString();
    }

    if (date === 9) {
      strDate = "10";
    }

    let dateStr = year + "-" + strmonth + "-" + strDate + "T00:00:00+00:00";

    const lookupPricebyDate = await prisma.history_price_DEC.findMany({
      where: {
        Asset: "DEC",
        Date: dateStr,
      },
      select: {
        id: true,
        Date: true,
        Close: true,
      },
    });

    /*
    loop through all the elements in this array
    updateSPLwithFindPriceDEC who's purpose is to find all 
    the data that will have price data that I can find and 
    update the data line with the closing price for that day 
    */

    await prisma.sPL.update({
      where: {
        id: element.id,
      },
      data: {
        Price: lookupPricebyDate[0].Close,
      },
    });
  }
  console.log("👍👍👍 DEC lookup complete");
}
