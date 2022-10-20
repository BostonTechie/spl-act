import prisma from "./prisma/client";

async function main() {
  // I have data that begins before my historical data For DEC token i declare a token price so I can define it as a fixed number later (8/10/2020)
  let firstDecPrice = new Date(2020, 7, 10);

  /* i update the prices for all tranactions that I have no data for below, this number or assumption could be wrong talk to Jesse */

  // const updateOldSPLwithDefaultPrice = await prisma.sPL.updateMany({
  //   where: {
  //     Token: "DEC",
  //     Created_Date: {
  //       lte: firstDecPrice,
  //     },
  //   },
  //   data: {
  //     Price: 0.000507,
  //   },
  // });

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
    take: 1,
  });

  for (let element of updateSPLwithFindPriceDEC) {
    let strmonth = "";

    /*this if controls logic for findinf prices of the DEC token that I have found in yahoo finance, note all data is after (8/10/2020) https://finance.yahoo.com/quote/DEC1-USD/history?period1=1594598400&period2=1666051200&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true*/

    let elementDate = element.Created_Date;
    let date = elementDate.getUTCDate();
    let month = elementDate.getUTCMonth();
    let year = elementDate.getUTCFullYear();

    if (month < 8) {
      strmonth = "0" + month.toString();
    } else if (month === 9) {
      strmonth = "10";
    } else strmonth = month.toString();

    let dateStr = year + "-" + strmonth + "-" + date + "T00:00:00+00:00";

    const lookupPricebyDate = await prisma.history_price.findMany({
      where: {
        Date: dateStr,
      },
      select: {
        Close: true,
      },
    });

    console.log(element, updateSPLwithFindPriceDEC, dateStr, lookupPricebyDate);
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
