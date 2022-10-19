import prisma from "./prisma/client";

async function main() {
  // I have data that begins before my historical data i declare a token price so I can define it as a fixed number later
  let firstDecPrice = new Date(2020, 7, 10);

  const findAllOldSPL = await prisma.sPL.findMany({
    where: {
      Token: "DEC",
      Created_Date: {
        lte: firstDecPrice,
      },
    },
  });

  let calculateDollars = findAllOldSPL.map((obj) => {
    return {
      inUSD: obj.Price * obj.Amount,
    };
  });

  const updateAllJeCoding = await prisma.sPL.updateMany({
    where: {
      Token: "DEC",
      Created_Date: {
        lte: firstDecPrice,
      },
    },
    data: {
      inUSD: calculateDollars,
    },
  });
  // const updateAllJeCoding = await prisma.sPL.updateMany({
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

  // console.log(findAllJeCoding);
  //Note: JavaScript counts months from 0 to 11: January = 0 December = 11.
  //   let firstDecPrice = new Date(2020, 7, 10);

  //   for (let element of findAllJeCoding) {
  //     let strmonth = "";
  //     if (element.Token === "DEC" && element.Created_Date <= firstDecPrice) {
  //       /*this if controls logic for date before the first close price of the DEC token that I have in yahoo finance (8/10/2020) https://finance.yahoo.com/quote/DEC1-USD/history?period1=1594598400&period2=1666051200&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true*/

  //       tokenPrice = 0.000507;
  //     } else {
  //       let elementDate = element.Created_Date;
  //       let date = elementDate.getUTCDate();
  //       let month = elementDate.getUTCMonth();
  //       let year = elementDate.getUTCFullYear();

  //       if (month < 8) {
  //         strmonth = "0" + month.toString();
  //       } else if (month === 9) {
  //         strmonth = "10";
  //       } else strmonth = month.toString();

  //       let dateStr = year + "-" + strmonth + "-" + date + "T00:00:00+00:00";

  //       const lookupPricebyDate = await prisma.history_price.findMany({
  //         where: {
  //           Date: dateStr,
  //         },
  //       });

  //       console.log(element, lookupPricebyDate);
  //     }
  //   }
  // }
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
