import { isDataView } from 'util/types';
import prisma from './prisma/client'



async function main() {
  let tokenPrice = 0

    const findAllJeCoding = await prisma.sPL.findMany({
    
      select: {
      id: true,
      Token: true,
      Created_Date: true,
    },
      take: 1

  })


  //Note: JavaScript counts months from 0 to 11: January = 0 December = 11.
  let firstDecPrice = new Date(2020,7,10)

   for (let element of findAllJeCoding){
     if ( element.Token === 'DEC' && element.Created_Date < firstDecPrice ){
      console.log(element,'.....',firstDecPrice)

      /*this if controls logic for date before the first close price of the DEC token that I have in yahoo finance (8/10/2020) https://finance.yahoo.com/quote/DEC1-USD/history?period1=1594598400&period2=1666051200&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true*/   

       
      tokenPrice = .000507
     }
    else
     console.log('after...',firstDecPrice)
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
