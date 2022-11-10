const prompt = new MultiSelect({
  name: "value",
  message: "What would you like to do? (press number)",
  limit: 7,
  choices: [
    {
      name: "0. Run a column script(buy/sell, internal/external)",
      value: "column",
    },
    { name: "1. Truncate a table", value: "truncate" },
  ],
});


import prisma from "./prisma/client";

async function main() {
  let tokenPrice = 0;

  const findAllJeCoding = await prisma.sPL.findMany({
    select: {
      id: true,
      Token: true,
      Created_Date: true,
    },
    where: {
      id: 54,
    },
    take: 1,
  });

  //Note: JavaScript counts months from 0 to 11: January = 0 December = 11.
  let firstDecPrice = new Date(2020, 7, 10);

  for (let element of findAllJeCoding) {
    let strmonth = "";
    if (element.Token === "DEC" && element.Created_Date <= firstDecPrice) {
      /*this if controls logic for date before the first close price of the DEC token that I have in yahoo finance (8/10/2020) https://finance.yahoo.com/quote/DEC1-USD/history?period1=1594598400&period2=1666051200&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true*/

      tokenPrice = 0.000507;
    } else {
      let elementDate = element.Created_Date;
      let date = elementDate.getUTCDate();
      let month = elementDate.getUTCMonth();
      let year = elementDate.getUTCFullYear();

      if (month < 10) {
        strmonth = "0" + month.toString();
        return strmonth;
      } else {
        strmonth = month.toString();
        return strmonth;
      }}

      console.log(strmonth);

      let dateStr = year + "-" + month + "-" + date + "T11:00:00+04:00";

      elementDate = new Date("2020-09-24T00:00:00+00:00");
      // let dateStr = new Date(
      //   year + "-" + month + "-" + date + "T00:00:00+00:00"
      // );

      // console.log(dateStr, elementDate);

      // const date1 = new Date("2016-07-25T00:00:00Z").getTime();
      // const date2 = new Date(dateStr);

      // const lookupPricebyDate = await prisma.history_price.findMany({
      //   where: {
      //     Date: dateStr,
      //   },
      // });
    }
  }

  // const findPriceDate = await prisma.history_price.findFirst({
  //   where: {
  //     Asset: findAllJeCoding[0].Token
  //   }
  // })

  // console.log(findAllJeCoding, findPriceDate)
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
