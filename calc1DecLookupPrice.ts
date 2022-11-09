import prisma from "./prisma/client";

async function main() {
  //the following code says that anything that is net in is a "buy", out is a "sell" used to detemine FIFO realized gains/loss calculation

  const updateBuy = await prisma.sPL.updateMany({
    where: {
      Amount: {
        gt: 0,
      },
    },
    data: {
      Buy_or_Sell: "Buy",
    },
  });

  const updateSell = await prisma.sPL.updateMany({
    where: {
      Amount: {
        lte: 0,
      },
    },
    data: {
      Buy_or_Sell: "Sell",
    },
  });

  // I have data that begins before my historical data For DEC token i declare a token price so I can define it as a fixed number later (8/10/2020)
  let firstDecPrice = new Date(2020, 7, 10);

  /* i update the prices for all tranactions that I have no data for below, this number or assumption could be wrong talk to Jesse */

  const updateOldSPLwithDefaultPrice = await prisma.sPL.updateMany({
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
    //take: 1,
  });

  for (let element of updateSPLwithFindPriceDEC) {
    let strmonth = "";
    let strDate = "";

    /*this if controls logic for findinf prices of the DEC token that I have found in yahoo finance, note all data is after (8/10/2020) https://finance.yahoo.com/quote/DEC1-USD/history?period1=1594598400&period2=1666051200&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true*/

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

    /*loop through all the elements in this array updateSPLwithFindPriceDEC who's purpose is to find all the data that will have price data that I can find and update the data line with the closing price for that day */

    const updateSPLwithFindPriceDEC = await prisma.sPL.update({
      where: {
        id: element.id,
      },
      data: {
        Price: lookupPricebyDate[0].Close,
      },
    });
  }
}
////----end of main function---------------------------------------

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect;
  });
