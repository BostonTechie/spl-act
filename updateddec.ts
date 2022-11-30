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
     before this date (approx) in game currency
     was not on the blockchain and had 
     no value
    */

  await prisma.sPL.updateMany({
    where: {
      Token: "DEC",
      Created_Date: {
        lte: firstDecPrice,
      },
    },
    data: {
      Price: 0.0,
    },
  });

  // console.log("👍👍👍 DEC lookup and USD complete");
  lookupDECPriceHistory2();

  async function lookupDECPriceHistory2() {
    /* 
        find oldest day in the DEC
        crypto table
      */
    let maxDate = await prisma.sPL.aggregate({
      where: {
        Token: "DEC",
      },
      _max: {
        Created_Date: true,
      },
    });

    /* 
        Create an array of
        all the dates you need to iterate through
        for the DEC token update the prices
        for all tokens traded on given day
      */

    let start = new Date(2020, 7, 10);
    let end = new Date(maxDate._max.Created_Date);
    let year = start.getFullYear();
    let month = start.getMonth();
    let day = start.getDate();
    let dates = [start];

    while (dates[dates.length - 1] < end) {
      dates.push(new Date(year, month, ++day));
    }

    for (let i = 0; i < dates.length - 1; i++) {
      let thisDate = dates[i];
      let nextDate = dates[i + 1];

      const lookupPricebyDate = await prisma.history_price_DEC.findMany({
        where: {
          AND: [
            {
              Date: {
                gte: thisDate,
              },
            },
            {
              Date: {
                lte: nextDate,
              },
            },
          ],
        },
        select: {
          id: true,
          Date: true,
          Close: true,
        },
      });

      //this code section updates the prices for any date after the first price date.. Meaning A price exist and can be found online, before (8/10/2020) no data seems to exist
      // await prisma.sPL.updateMany({
      //   where: {
      //     AND: [
      //       {
      //         Token: "DEC",
      //       },
      //       {
      //         Created_Date: {
      //           gte: thisDate,
      //         },
      //       },
      //       {
      //         Created_Date: {
      //           lte: nextDate,
      //         },
      //       },
      //     ],
      //   },
      //   data: {
      //     Price: lookupPricebyDate[0].Close,
      //   },
      //   //if you want to run a smaller sample uncomment next line
      //   // take: 1,
      // });
    }

    lookupDECPriceHistory3();
    async function lookupDECPriceHistory3() {
      let calcUSd = await prisma.sPL.findMany({
        where: {
          Token: "DEC",
        },
        select: {
          id: true,
          Amount: true,
          Price: true,
        },
        take: 4,
      });

      let usdArray = [];
      let idArray = [];
      let calcEUsd = 0;
      calcUSd.forEach((element) => {
        calcEUsd = Number(element.Amount) * Number(element.Price);

        usdArray.push(calcEUsd);
        idArray.push(Number(element.id));
      });

      let anyDecimal = 3.03;

      prisma.sPL.updateMany({
        where: {
          id: {
            in: [1, 2, 3, 4],
          },
        },
        data: {
          inUSD: usdArray,
        },
      });

      console.log(idArray);
    }
  }

  console.log("👍👍👍 DEC lookup and USD complete");
}
