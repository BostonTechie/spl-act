import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";

export async function smallRealizedBatch1(findAllFifobyType, findFirstFifo) {
  /* 
    Data structurce:..

    [
        {
            id: 1,
            Realized: 0,
            Buy_or_Sell: 'Buy',
            Fifo: {
            id: 1,
            Price: '0',
            Token: 'DEC',
            inUSD: '0',
            Amount: '50914',
            Account: 'Aggroed',
            Buy_or_Sell: 'Buy',
            Created_Date: '2020-06-11T12:46:36.000Z',
            Original_Type: 'Buy',
            Original_Price: '0',
            Original_Amount: '50914',
            Remaining_Amount: '50914',
            Internal_or_External: 'External'
            },
            LevelFifo: {
            id: 1,
            Price: '0',
            Token: 'DEC',
            inUSD: '0',
            Amount: '50914',
            Account: 'Aggroed',
            Buy_or_Sell: 'Buy',
            Created_Date: '2020-06-11T12:46:36.000Z',
            Original_Type: 'Buy',
            Original_Price: '0',
            Original_Amount: '50914',
            Remaining_Amount: '50914',
            Internal_or_External: 'External'
            },
            MultiLevelFifo: null,
            sPLId: 1
        }
        ]
  */

  for (let thisRowofFifo of findAllFifobyType) {
    if (thisRowofFifo.Fifo["Buy_or_Sell"] === "Sell") {
      /* 
        When you grab the current sell trans
        you have to then grab the level of FIFO
        that is currently being consumed i.e. the id of 
        LevelFifo (column in DB) - 1
      */
      let prevId = Number(thisRowofFifo.Fifo["id"]) - 1;

      let prevLevel = await prisma.fifo.findUnique({
        where: {
          id: prevId,
        },
        select: {
          LevelFifo: true,
        },
      });

      /* 
        Define the got variables 
        as Typescript numbers
      */

      let currentSellAmount = Number(thisRowofFifo.Fifo["Amount"]);
      let currentPrice = Number(thisRowofFifo.Fifo["Price"]);
      let prevLevelFifoAmount = Number(prevLevel.LevelFifo["Remaining_Amount"]);
      let prevLevelFifoPrice = Number(prevLevel.LevelFifo["Original_Price"]);
      let amountNotLessThanZero =
        Number(prevLevelFifoAmount) + Number(currentSellAmount);
      let costBasis = 0;
      let accumulateRealized = 0;
      let leftToSell = 0;
      let maxRemainSell = Number(prevLevel.LevelFifo["Remaining_Amount"]);
      let multiSellArray = [];

      if (amountNotLessThanZero > 0) {
        /* 
              calcualte realized gain/ loss in the case that
         the sell doesn't fully consume the FIFO level
        */
        costBasis = currentSellAmount * prevLevelFifoPrice;
        let soldInUSD = currentPrice * currentSellAmount;
        let calcRealized = soldInUSD - costBasis;

        // console.log(
        //   `id: ${thisRowofFifo.Fifo["id"]}
        //   sell price: ${currentPrice}
        //   fifo Price: ${prevLevelFifoPrice}
        //   sell amount: ${currentSellAmount}
        //   Remaining Amount: ${amountNotLessThanZero}`
        // );

        await prisma.fifo.upsert({
          where: {
            id: thisRowofFifo.id,
          },
          update: {
            Realized: calcRealized,
            LevelFifo: {
              id: prevLevel.LevelFifo["id"],
              Original_Price: prevLevel.LevelFifo["Original_Price"],
              Price_Of_Current_Sale: thisRowofFifo.Fifo["Price"],
              Token: prevLevel.LevelFifo["Token"],
              inUSD: prevLevel.LevelFifo["inUSD"],
              Original_Amount: prevLevel.LevelFifo["Amount"],
              Consumed_Amount_For_This_Sale: thisRowofFifo.Fifo["Amount"],
              Remaining_Amount: amountNotLessThanZero,
              Account: prevLevel.LevelFifo["Account"],
              Original_Type: prevLevel.LevelFifo["Original_Type"],
              Row_Type: thisRowofFifo.Fifo["Buy_or_Sell"],
              FIFO_Date: prevLevel.LevelFifo["Created_Date"],
              Sale_Date: thisRowofFifo.Fifo["Date"],
              Internal_or_External: thisRowofFifo.Fifo["Internal_or_External"],
              Realized: calcRealized,
            },
          },
          create: {
            Realized: calcRealized,
            LevelFifo: {
              id: prevLevel.LevelFifo["id"],
              Original_Price: prevLevel.LevelFifo["Original_Price"],
              Price_Of_Current_Sale: thisRowofFifo.Fifo["Price"],
              Token: prevLevel.LevelFifo["Token"],
              inUSD: prevLevel.LevelFifo["inUSD"],
              Original_Amount: prevLevel.LevelFifo["Amount"],
              Consumed_Amount_For_This_Sale: thisRowofFifo.Fifo["Amount"],
              Remaining_Amount: amountNotLessThanZero,
              Account: prevLevel.LevelFifo["Account"],
              Original_Type: prevLevel.LevelFifo["Original_Type"],
              Row_Type: thisRowofFifo.Fifo["Buy_or_Sell"],
              FIFO_Date: prevLevel.LevelFifo["Created_Date"],
              Sale_Date: thisRowofFifo.Fifo["Date"],
              Internal_or_External: thisRowofFifo.Fifo["Internal_or_External"],
              Realized: calcRealized,
            },
          },
        });
      }

      if (amountNotLessThanZero < 0) {
        let i = 0;
        let myNull = "notnull";
        leftToSell = currentSellAmount + maxRemainSell;
        while (myNull === "notnull") {
          /*
           in the case your sell
           consumes multiple levels of buys
           this script tracks what the total sell is
           versus the size of the buy in the givencle
           level of FIFO
          */

          let nextBuyId = Number(prevLevel.LevelFifo["id"] + i);
          let soldInUSD = currentPrice * maxRemainSell;
          let calcRealized = soldInUSD - costBasis;
          accumulateRealized = accumulateRealized + calcRealized;

          if (i === 0) {
            multiSellArray.push({
              id: nextBuyId,
              Original_Price: prevLevel.LevelFifo["Original_Price"],
              Price_Of_Current_Sale: thisRowofFifo.Fifo["Price"],
              Token: prevLevel.LevelFifo["Token"],
              inUSD: prevLevel.LevelFifo["inUSD"],
              Original_Amount: prevLevel.LevelFifo["Amount"],
              Consumed_Amount_For_This_Sale: maxRemainSell,
              Remaining_Amount: prevLevelFifoAmount - maxRemainSell,
              Account: prevLevel.LevelFifo["Account"],
              Original_Type: prevLevel.LevelFifo["Original_Type"],
              Row_Type: thisRowofFifo.Fifo["Buy_or_Sell"],
              FIFO_Date: prevLevel.LevelFifo["Created_Date"],
              Sale_Date: thisRowofFifo.Fifo["Created_Date"],
              Internal_or_External: thisRowofFifo.Fifo["Internal_or_External"],
              Realized: calcRealized,
            });
          }

          let nextBuy = await prisma.fifo.findFirst({
            orderBy: {
              id: "asc",
            },
            where: {
              id: {
                gte: nextBuyId,
              },
              Buy_or_Sell: "Buy",
            },
          });

          if (i > 0) {
            if (-leftToSell >= nextBuy.Fifo["Original_Amount"]) {
              maxRemainSell = nextBuy.Fifo["Original_Amount"];

              multiSellArray.push({
                id: nextBuyId,
                currentSellAmount: currentSellAmount,
                leftToSell: leftToSell,
                Original_Price: nextBuy.Fifo["Original_Price"],
                Price_Of_Current_Sale: thisRowofFifo.Fifo["Price"],
                Token: nextBuy.Fifo["Token"],
                inUSD: nextBuy.Fifo["inUSD"],
                Original_Amount: nextBuy.Fifo["Amount"],
                Consumed_Amount_For_This_Sale: maxRemainSell,
                Remaining_Amount: 0,
                Account: nextBuy.Fifo["Account"],
                Original_Type: prevLevel.LevelFifo["Original_Type"],
                Row_Type: thisRowofFifo.Fifo["Buy_or_Sell"],
                FIFO_Date: nextBuy.Fifo["Created_Date"],
                Sale_Date: thisRowofFifo.Fifo["Created_Date"],
                Internal_or_External:
                  thisRowofFifo.Fifo["Internal_or_External"],
                Realized: calcRealized,
              });

              leftToSell = leftToSell + Number(maxRemainSell);
            } else {
              maxRemainSell =
                Number(nextBuy.Fifo["Original_Amount"]) + leftToSell;

              multiSellArray.push({
                id: nextBuyId,
                currentSellAmount: currentSellAmount,
                leftToSell: leftToSell,
                Original_Price: nextBuy.Fifo["Original_Price"],
                Price_Of_Current_Sale: thisRowofFifo.Fifo["Price"],
                Token: nextBuy.Fifo["Token"],
                inUSD: nextBuy.Fifo["inUSD"],
                Original_Amount: nextBuy.Fifo["Amount"],
                Consumed_Amount_For_This_Sale:
                  Number(nextBuy.Fifo["Amount"]) - maxRemainSell,
                Remaining_Amount: maxRemainSell,
                Account: nextBuy.Fifo["Account"],
                Original_Type: prevLevel.LevelFifo["Original_Type"],
                Row_Type: thisRowofFifo.Fifo["Buy_or_Sell"],
                FIFO_Date: nextBuy.Fifo["Created_Date"],
                Sale_Date: thisRowofFifo.Fifo["Created_Date"],
                Internal_or_External:
                  thisRowofFifo.Fifo["Internal_or_External"],
                Realized: calcRealized,
                AccumulateRealized: accumulateRealized,
              });
              myNull = "cancel while loop found all the buys we need";

              let typeCO = Number(nextBuy.id) + 1;
              let arrayLength = multiSellArray.length - 1;

              await prisma.fifo.upsert({
                where: {
                  id: typeCO,
                },
                create: {
                  LevelFifo: multiSellArray[arrayLength],
                  MultiLevelFifo: multiSellArray,
                  Realized: accumulateRealized,
                },
                update: {
                  LevelFifo: multiSellArray[arrayLength],
                  MultiLevelFifo: multiSellArray,
                  Realized: accumulateRealized,
                },
              });
            }
          }

          i++;
        }
        // console.log(multiSellArray);
      }
    }

    if (thisRowofFifo.Fifo["Buy_or_Sell"] === "Buy") {
      /* 
        When you grab the current sell trans
        you have to then grab the level of FIFO
        that is currently being consumed i.e. the id of 
        LevelFifo (column in DB) - 1
      */
      let prevId = Number(thisRowofFifo.Fifo["id"]) - 1;

      let prevLevel = await prisma.fifo.findUnique({
        where: {
          id: prevId,
        },
        select: {
          LevelFifo: true,
        },
      });

      /* 
        Define the got variables 
        as Typescript numbers
      */

      await prisma.fifo.upsert({
        where: {
          id: thisRowofFifo.id,
        },
        update: {
          Realized: 0.0,
          LevelFifo: prevLevel.LevelFifo,
        },
        create: {
          Realized: 0.0,
          LevelFifo: prevLevel.LevelFifo,
        },
      });
    }
  }
}
