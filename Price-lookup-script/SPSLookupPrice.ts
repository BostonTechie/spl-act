import prisma from "../prisma/client";

async function main() {
  // I have data that begins before my historical data For SPS token i declar a token price so I can define it as a fixed number later (7/26/2021)
  let firstSPSPrice = new Date(2021, 6, 26);

  /* i update the prices for all tranactions that I have no data for below, this number or assumption could be wrong talk to Jesse */

  // const updateOldSPLwithDefaultPrice = await prisma.sPL.updateMany({
  //   where: {
  //     Token: "SPS",
  //     Created_Date: {
  //       lte: firstSPSPrice,
  //     },
  //   },
  //   data: {
  //     Price: 0.246423,
  //   },
  // });

  const updateSPLwithFindPriceSPS = await prisma.sPL.findMany({
    where: {
      Token: "SPS",
      Created_Date: {
        gt: firstSPSPrice,
      },
    },
    select: {
      id: true,
      Created_Date: true,
    },
    //take: 1,
  });

  for (let element of updateSPLwithFindPriceSPS) {
    let strmonth = "";
    let strDate = "";

    /*this if controls logic for findinf prices of the SPS token that I have found in yahoo finance, note all data is after (7/26/2021) https://finance.yahoo.com/quote/SPS-USD/history?period1=1508284800&period2=1666051200&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true

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

    const lookupPricebyDate = await prisma.history_price.findMany({
      where: {
        Asset: "SPS",
        Date: dateStr,
      },
      select: {
        id: true,
        Date: true,
        Close: true,
      },
    });

    /*loop through all the elements in this array updateSPLwithFindPriceSPS who's purpose is to find all the data that will have price data that I can find and update the data line with the closing price for that day */

    const updateSPLwithFindPriceSPS = await prisma.sPL.update({
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
