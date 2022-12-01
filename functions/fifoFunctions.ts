import prisma from "../prisma/client";
const { NumberPrompt, Confirm } = require("enquirer");
import { mainPrompt } from "../mainPrompts";
import { Prisma } from "@prisma/client";

export function fifoPrompt() {
  //controls the console prompting in this page
  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter the number for your selection",
  });

  console.log("Please enter one of the following options");
  console.log("0...calc FIFO ");
  console.log("1...calc Credits");
  console.log("2...calc cumulative sell + previous cumulative sell");
  console.log("3...RX the balance '");
  console.log("4... ");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      answer = null;
      fifoUpdateColumn().catch((e) => {
        console.error(e);
        process.exit(1);
      });
    }
    if (answer === 1) {
      answer = null;
      fifoUpdateColumnCredits().catch((e) => {
        console.error(e);
        process.exit(1);
      });
    }

    if (answer === 9) {
      mainPrompt();
    }
  });
}

async function rxBalance() {
  console.log("🌟🌟🌟 starting calc of RXBalance");
  /* 
     Grab all the unique accounts
     to loop thrugh later in function
    */

  const findAllAccounts = await prisma.listing_Account.findMany({
    select: {
      Account: true,
    },
  });

  /* 
    get all unique Tokens to loop
    through later in the function
  */
  const findAllTokens = await prisma.listing_Token.findMany({
    select: {
      Token: true,
    },
  });

  /* 
    Loop through all of the Token names buy 
    account and calculate the cumulative buy
    Balance, to ensure data intergrity
  */

  for (let accountName of findAllAccounts) {
    for (let TokenName of findAllTokens) {
      let sumOfBuyfromWallet = await prisma.sPL.findMany({
        orderBy: {
          id: "asc",
        },
        where: {
          Token: TokenName.Token,
          Account: accountName.Account,
        },
        select: {
          id: true,
          Created_Date: true,
          Amount: true,
        },
        // take: 2,
      });

      let currentSumAmount = 0;
      let previousSumAmount = 0;

      /* 
        store the previous sum amount
        add in the amount from the current buy record
        in the DB
      */
      for (let uniqueID of sumOfBuyfromWallet) {
        previousSumAmount = currentSumAmount;
        currentSumAmount = Number(currentSumAmount) + Number(uniqueID.Amount);

        await prisma.sPL.update({
          where: {
            id: uniqueID.id,
          },
          data: {
            BalanceRX: currentSumAmount,
          },
        });
      }
    }
  }
  console.log("👍👍👍 Completed calc of RXBalance");
}

async function fifoUpdateColumn() {
  /* 
    In this function I call all the data
    in order of date from Oldest to youngest
    I put all of that data into a JSON
    as the function rolls through time it calcs the
    realized gains for any Sell based on the first
    item (FIFO) queued in the JSON array,
    every new buy adds a new "level" to the que of FIFO
    JSON array
  */

  console.log("🌟🌟🌟 Updating FiFo column");
  /* 
     Grab all the unique accounts
     to loop thrugh later in function
    */

  const findAllAccounts = await prisma.listing_Account.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      Account: true,
    },
  });

  /* 
    get all unique Tokens to loop
    through later in the function
  */
  const findAllTokens = await prisma.listing_Token.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      Token: true,
    },
  });

  /* 
    Created Id Array is an an Array
    to store the unique id every time
    the logic gets onto a new Token within
    a new account. Every time this new situation 
    occurs, by definition that should be the first 
    level of FIFO, assuming  your data is 
    organized by date ascending
  */
  let createdIdArrayFirstFifoLevel = [];

  for (let accountName of findAllAccounts) {
    for (let TokenName of findAllTokens) {
      let tName = TokenName.Token;
      let aName = accountName.Account;
      //   /*
      //     In the case that there are more than
      //     250,000 (batchSize) transactions this next section
      //     of code will split that data into chucks
      //     in order to process it, otherwise script
      //     runs into error:
      //      " let createFifoJson = await prisma.sPL.findMany(
      //      Failed to convert rust `String` into napi `string`"
      //   */
      //   let countTrans = await prisma.sPL.count({
      //     where: {
      //       Token: TokenName.Token,
      //       Account: accountName.Account,
      //     },
      //   });

      //   /*
      //    Just let user know where you are
      //    so they don't think script is frozen
      //   */
      //   let batchSize = 250000;

      //   let numberOfTransCount = countTrans / batchSize;

      //   console.log(
      //     "processing first level Fifo for: ",
      //     countTrans,
      //     "transactions",
      //     accountName,
      //     TokenName
      //   );

      //   if (Math.floor(numberOfTransCount) > 0) {
      //     let lengthOf250k = Math.floor(numberOfTransCount) + 1;

      //     for (let countLength = 0; countLength < lengthOf250k; countLength++) {
      //       let skipthisMany = countLength * batchSize;

      //       /*
      //         Let user know where
      //         script is
      //       */
      //       console.log(
      //         "processing batch# ",
      //         countLength,
      //         " of ",
      //         countTrans,
      //         accountName,
      //         TokenName
      //       );

      //       /*
      //         In the case that there are more than
      //         250,000 transactions this next section
      //         of code will split that data into chucks
      //         in order to process it, otherwise script
      //         runs into error:
      //         " let createFifoJson = await prisma.sPL.findMany(
      //         Failed to convert rust `String` into napi `string`"
      //       */

      //       let createFifoJsonbatch = await prisma.sPL.findMany({
      //         orderBy: {
      //           id: "asc",
      //         },
      //         where: {
      //           Token: TokenName.Token,
      //           Account: accountName.Account,
      //         },
      //         select: {
      //           id: true,
      //           Token: true,
      //           Amount: true,
      //           Created_Date: true,
      //           Account: true,
      //           Price: true,
      //           inUSD: true,
      //           Buy_or_Sell: true,
      //           Internal_or_External: true,
      //         },
      //         take: batchSize,
      //         skip: skipthisMany,
      //       });

      //       // i used in for loop below
      //       let i = 0;

      //       for (let uniqueID of createFifoJsonbatch) {
      //         /*
      //           Creates a JSON to store the Original
      //           values of a Buy to be used by FIFO
      //         */

      //         let jsonUpdateCol = [
      //           {
      //             id: uniqueID.id,
      //             Token: uniqueID.Token,
      //             Amount: uniqueID.Amount,
      //             Original_Amount: uniqueID.Amount,
      //             Remaining_Amount: uniqueID.Amount,
      //             Created_Date: uniqueID.Created_Date,
      //             Account: uniqueID.Account,
      //             Original_Price: uniqueID.Price,
      //             Price: uniqueID.Price,
      //             inUSD: uniqueID.inUSD,
      //             Buy_or_Sell: uniqueID.Buy_or_Sell,
      //             Original_Type: uniqueID.Buy_or_Sell,
      //             Internal_or_External: uniqueID.Internal_or_External,
      //           },
      //         ] as unknown as Prisma.JsonObject;

      //         let getZeroArray = jsonUpdateCol[0];

      //         /*
      //           create an array to use as filter later
      //           in this function to loop through
      //         */

      //         if (i === 0) {
      //           createdIdArrayFirstFifoLevel.push(uniqueID.id);

      //           /*
      //               Fifo must always start
      //               at the very first transaction
      //               and roll from there, in theroy
      //               that transaction would always be
      //               a buy
      //             */

      //           await prisma.fifo.upsert({
      //             where: {
      //               id: uniqueID.id,
      //             },
      //             update: {
      //               Fifo: getZeroArray,
      //               Buy_or_Sell: uniqueID.Buy_or_Sell,
      //               LevelFifo: getZeroArray,
      //               SPL: {
      //                 connect: {
      //                   id: uniqueID.id,
      //                 },
      //               },
      //             },
      //             create: {
      //               Fifo: getZeroArray,
      //               Buy_or_Sell: uniqueID.Buy_or_Sell,
      //               LevelFifo: getZeroArray,
      //               SPL: {
      //                 connect: {
      //                   id: uniqueID.id,
      //                 },
      //               },
      //             },
      //           });
      //           i++;
      //         }
      //         /*
      //           Create or update the
      //           Fifo column which just stores a
      //           frozen value
      //         */
      //         if (i != 0) {
      //           await prisma.fifo.upsert({
      //             where: {
      //               id: uniqueID.id,
      //             },
      //             update: {
      //               Buy_or_Sell: uniqueID.Buy_or_Sell,
      //               Fifo: getZeroArray,
      //               SPL: {
      //                 connect: {
      //                   id: uniqueID.id,
      //                 },
      //               },
      //             },
      //             create: {
      //               Buy_or_Sell: uniqueID.Buy_or_Sell,
      //               Fifo: getZeroArray,
      //               SPL: {
      //                 connect: {
      //                   id: uniqueID.id,
      //                 },
      //               },
      //             },
      //           });
      //         }
      //       }
      //     }
      //   } else {
      //     /*
      //         In the case that there are less than
      //         250,000 (batchSize) transactions this next section
      //         of code will split that data into chucks
      //         in order to process it, otherwise script
      //         runs into error:
      //         " let createFifoJson = await prisma.sPL.findMany(
      //         Failed to convert rust `String` into napi `string`"
      //       */

      //     let createFifoJson = await prisma.sPL.findMany({
      //       orderBy: {
      //         id: "asc",
      //       },
      //       where: {
      //         Token: TokenName.Token,
      //         Account: accountName.Account,
      //       },
      //       select: {
      //         id: true,
      //         Token: true,
      //         Amount: true,
      //         Created_Date: true,
      //         Account: true,
      //         Price: true,
      //         inUSD: true,
      //         Buy_or_Sell: true,
      //         Internal_or_External: true,
      //       },
      //       // take: 1,
      //     });
      //     // i used in for loop below
      //     let i = 0;
      //     for (let uniqueID of createFifoJson) {
      //       /*
      //             Creates a JSON to store the Original
      //             values of a Buy to be used by FIFO
      //           */
      //       let jsonUpdateCol = [
      //         {
      //           id: uniqueID.id,
      //           Token: uniqueID.Token,
      //           Amount: uniqueID.Amount,
      //           Original_Amount: uniqueID.Amount,
      //           Remaining_Amount: uniqueID.Amount,
      //           Created_Date: uniqueID.Created_Date,
      //           Account: uniqueID.Account,
      //           Original_Price: uniqueID.Price,
      //           Price: uniqueID.Price,
      //           inUSD: uniqueID.inUSD,
      //           Buy_or_Sell: uniqueID.Buy_or_Sell,
      //           Original_Type: uniqueID.Buy_or_Sell,
      //           Internal_or_External: uniqueID.Internal_or_External,
      //         },
      //       ] as unknown as Prisma.JsonObject;
      //       let getZeroArray = jsonUpdateCol[0];
      //       /*
      //             create an array to use as filter later
      //             in this function to loop through
      //           */
      //       if (i === 0) {
      //         createdIdArrayFirstFifoLevel.push(uniqueID.id);
      //         /*
      //                 Fifo must always start
      //                 at the very first transaction
      //                 and roll from there, in theroy
      //                 that transaction would always be
      //                 a buy
      //               */
      //         await prisma.fifo.upsert({
      //           where: {
      //             id: uniqueID.id,
      //           },
      //           update: {
      //             Fifo: getZeroArray,
      //             Buy_or_Sell: uniqueID.Buy_or_Sell,
      //             LevelFifo: getZeroArray,
      //             SPL: {
      //               connect: {
      //                 id: uniqueID.id,
      //               },
      //             },
      //           },
      //           create: {
      //             Fifo: getZeroArray,
      //             Buy_or_Sell: uniqueID.Buy_or_Sell,
      //             LevelFifo: getZeroArray,
      //             SPL: {
      //               connect: {
      //                 id: uniqueID.id,
      //               },
      //             },
      //           },
      //         });
      //         i++;
      //       }
      //       /*
      //             Create or update the
      //             Fifo column which just stores a
      //             frozen value
      //           */
      //       if (i != 0) {
      //         await prisma.fifo.upsert({
      //           where: {
      //             id: uniqueID.id,
      //           },
      //           update: {
      //             Buy_or_Sell: uniqueID.Buy_or_Sell,
      //             Fifo: getZeroArray,
      //             SPL: {
      //               connect: {
      //                 id: uniqueID.id,
      //               },
      //             },
      //           },
      //           create: {
      //             Buy_or_Sell: uniqueID.Buy_or_Sell,
      //             Fifo: getZeroArray,
      //             SPL: {
      //               connect: {
      //                 id: uniqueID.id,
      //               },
      //             },
      //           },
      //         });
      //       }
      //     }
      //   }
      findFirstTransFunc(tName, aName);
    }
  }
}

async function fifoUpdateColumnCredits() {
  /* 
    In this function I call all the data
    in order of date from Oldest to youngest
    I put all of that data into a JSON
    as the function rolls through time it calcs the
    realized gains for any Sell based on the first
    item (FIFO) queued in the JSON array,
    every new buy adds a new "level" to the que of FIFO
    JSON array
  */

  console.log("🌟🌟🌟 Updating FiFo column Credits");
  /* 
     Grab all the unique accounts
     to loop thrugh later in function
    */

  const findAllAccounts = await prisma.listing_Account.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      Account: true,
    },
  });

  /* 
    Created Id Array is an an Array
    to store the unique id every time
    the logic gets onto a new Token within
    a new account. Every time this new situation 
    occurs, by definition that should be the first 
    level of FIFO, assuming  your data is 
    organized by date ascending
  */
  let createdIdArrayFirstFifoLevel = [];

  for (let accountName of findAllAccounts) {
    let tName = "CREDITS";
    let aName = accountName.Account;
    /*
        In the case that there are more than
        250,000 (batchSize) transactions this next section
        of code will split that data into chucks
        in order to process it, otherwise script
        runs into error:
         " let createFifoJson = await prisma.sPL.findMany(
         Failed to convert rust `String` into napi `string`"
      */
    let countTrans = await prisma.sPL.count({
      where: {
        Token: tName,
        Account: accountName.Account,
      },
    });

    /*
       Just let user know where you are
       so they don't think script is frozen
      */
    let batchSize = 250000;

    let numberOfTransCount = countTrans / batchSize;

    console.log(
      "processing first level Fifo for: ",
      countTrans,
      "transactions",
      accountName,
      tName
    );

    if (Math.floor(numberOfTransCount) > 0) {
      let lengthOf250k = Math.floor(numberOfTransCount) + 1;

      for (let countLength = 0; countLength < lengthOf250k; countLength++) {
        let skipthisMany = countLength * batchSize;

        /*
            Let user know where
            script is
          */
        console.log(
          "processing batch# ",
          countLength,
          " of ",
          countTrans,
          accountName,
          tName
        );

        /*
            In the case that there are more than
            250,000 transactions this next section
            of code will split that data into chucks
            in order to process it, otherwise script
            runs into error:
            " let createFifoJson = await prisma.sPL.findMany(
            Failed to convert rust `String` into napi `string`"
          */

        let createFifoJsonbatch = await prisma.sPL.findMany({
          orderBy: {
            id: "asc",
          },
          where: {
            Token: tName,
            Account: accountName.Account,
          },
          select: {
            id: true,
            Token: true,
            Amount: true,
            Created_Date: true,
            Account: true,
            Price: true,
            inUSD: true,
            Buy_or_Sell: true,
            Internal_or_External: true,
          },
          take: batchSize,
          skip: skipthisMany,
        });

        // i used in for loop below
        let i = 0;

        for (let uniqueID of createFifoJsonbatch) {
          /*
              Creates a JSON to store the Original
              values of a Buy to be used by FIFO
            */

          let jsonUpdateCol = [
            {
              id: uniqueID.id,
              Token: uniqueID.Token,
              Amount: uniqueID.Amount,
              Original_Amount: uniqueID.Amount,
              Remaining_Amount: uniqueID.Amount,
              Created_Date: uniqueID.Created_Date,
              Account: uniqueID.Account,
              Original_Price: uniqueID.Price,
              Price: uniqueID.Price,
              inUSD: uniqueID.inUSD,
              Buy_or_Sell: uniqueID.Buy_or_Sell,
              Original_Type: uniqueID.Buy_or_Sell,
              Internal_or_External: uniqueID.Internal_or_External,
            },
          ] as unknown as Prisma.JsonObject;

          let getZeroArray = jsonUpdateCol[0];

          /*
              create an array to use as filter later
              in this function to loop through
            */

          if (i === 0) {
            createdIdArrayFirstFifoLevel.push(uniqueID.id);

            /*
                  Fifo must always start
                  at the very first transaction
                  and roll from there, in theroy
                  that transaction would always be
                  a buy
                */

            await prisma.fifo.upsert({
              where: {
                id: uniqueID.id,
              },
              update: {
                Fifo: getZeroArray,
                Buy_or_Sell: uniqueID.Buy_or_Sell,
                LevelFifo: getZeroArray,
                SPL: {
                  connect: {
                    id: uniqueID.id,
                  },
                },
              },
              create: {
                Fifo: getZeroArray,
                Buy_or_Sell: uniqueID.Buy_or_Sell,
                LevelFifo: getZeroArray,
                SPL: {
                  connect: {
                    id: uniqueID.id,
                  },
                },
              },
            });
            i++;
          }
          /*
              Create or update the
              Fifo column which just stores a
              frozen value
            */
          if (i != 0) {
            await prisma.fifo.upsert({
              where: {
                id: uniqueID.id,
              },
              update: {
                Buy_or_Sell: uniqueID.Buy_or_Sell,
                Fifo: getZeroArray,
                SPL: {
                  connect: {
                    id: uniqueID.id,
                  },
                },
              },
              create: {
                Buy_or_Sell: uniqueID.Buy_or_Sell,
                Fifo: getZeroArray,
                SPL: {
                  connect: {
                    id: uniqueID.id,
                  },
                },
              },
            });
          }
        }
      }
    } else {
      /*
            In the case that there are less than
            250,000 (batchSize) transactions this next section
            of code will split that data into chucks
            in order to process it, otherwise script
            runs into error:
            " let createFifoJson = await prisma.sPL.findMany(
            Failed to convert rust `String` into napi `string`"
          */

      let createFifoJson = await prisma.sPL.findMany({
        orderBy: {
          id: "asc",
        },
        where: {
          Token: tName,
          Account: accountName.Account,
        },
        select: {
          id: true,
          Token: true,
          Amount: true,
          Created_Date: true,
          Account: true,
          Price: true,
          inUSD: true,
          Buy_or_Sell: true,
          Internal_or_External: true,
        },
        // take: 1,
      });
      // i used in for loop below
      let i = 0;
      for (let uniqueID of createFifoJson) {
        /*
                Creates a JSON to store the Original
                values of a Buy to be used by FIFO
              */
        let jsonUpdateCol = [
          {
            id: uniqueID.id,
            Token: uniqueID.Token,
            Amount: uniqueID.Amount,
            Original_Amount: uniqueID.Amount,
            Remaining_Amount: uniqueID.Amount,
            Created_Date: uniqueID.Created_Date,
            Account: uniqueID.Account,
            Original_Price: uniqueID.Price,
            Price: uniqueID.Price,
            inUSD: uniqueID.inUSD,
            Buy_or_Sell: uniqueID.Buy_or_Sell,
            Original_Type: uniqueID.Buy_or_Sell,
            Internal_or_External: uniqueID.Internal_or_External,
          },
        ] as unknown as Prisma.JsonObject;
        let getZeroArray = jsonUpdateCol[0];
        /*
                create an array to use as filter later
                in this function to loop through
              */
        if (i === 0) {
          createdIdArrayFirstFifoLevel.push(uniqueID.id);
          /*
                    Fifo must always start
                    at the very first transaction
                    and roll from there, in theroy
                    that transaction would always be
                    a buy
                  */
          await prisma.fifo.upsert({
            where: {
              id: uniqueID.id,
            },
            update: {
              Fifo: getZeroArray,
              Buy_or_Sell: uniqueID.Buy_or_Sell,
              LevelFifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
            create: {
              Fifo: getZeroArray,
              Buy_or_Sell: uniqueID.Buy_or_Sell,
              LevelFifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
          });
          i++;
        }
        /*
                Create or update the
                Fifo column which just stores a
                frozen value
              */
        if (i != 0) {
          await prisma.fifo.upsert({
            where: {
              id: uniqueID.id,
            },
            update: {
              Buy_or_Sell: uniqueID.Buy_or_Sell,
              Fifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
            create: {
              Buy_or_Sell: uniqueID.Buy_or_Sell,
              Fifo: getZeroArray,
              SPL: {
                connect: {
                  id: uniqueID.id,
                },
              },
            },
          });
        }
      }
    }
    findFirstTransFunc(tName, aName);
  }
}

async function findFirstTransFunc(tName, aName) {
  /*
    In this function I call all the data
    in order of date from Oldest to youngest
    I put all of that data into a JSON
    as the function rolls through time it calcs the
    realized gains for any Sell based on the first
    item (FIFO) queued in the JSON array,
    every new  buy adds a new "level" to the que of FIFO
    JSON array
  */
  // let referenceFind = await prisma.fifo.findMany({
  //   where: {},
  //   take: 1,
  // });
  // console.log(referenceFind);
  // let findFirst = await prisma.fifo.findFirst({
  //   orderBy: {
  //     id: "asc",
  //   },
  //   where: {
  //     AND: [
  //       {
  //         LevelFifo: {
  //           path: ["Account"],
  //           equals: `${aName}`,
  //         },
  //       },
  //       {
  //         LevelFifo: {
  //           path: ["Token"],
  //           equals: `${tName}`,
  //         },
  //       },
  //     ],
  //   },
  //   select: {
  //     /*
  //       This id will be on the line
  //       not within the Fifo column itself
  //     */
  //     id: true,
  //   },
  // });
  // if (findFirst != null) {
  //   let uniqueID = findFirst.id;
  //   let notNullCombAccount = aName;
  //   let notNullCombToken = tName;
  //   calcFifoFunction(uniqueID, notNullCombAccount, notNullCombToken);
  // }
}

async function calcFifoFunction(
  uniqueID,
  notNullCombAccount,
  notNullCombToken
) {
  /* 
   using the unique ids
   in the previous funtion
   I grab the unique token, account
   combos
  */

  let uniqueAccPlusToken = await prisma.fifo.findUniqueOrThrow({
    where: {
      id: uniqueID,
    },
    select: {
      id: true,
      Fifo: true,
      LevelFifo: true,
    },
  });

  /* 
    save variables for later use
  */
  let uniqueAccount = uniqueAccPlusToken.LevelFifo["Account"];
  let uniqueToken = uniqueAccPlusToken.LevelFifo["Token"];

  let findFifoTransactions = await prisma.fifo.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      AND: [
        {
          LevelFifo: {
            path: ["Account"],
            equals: `${uniqueAccount}`,
          },
        },
        {
          LevelFifo: {
            path: ["Token"],
            equals: `${uniqueToken}`,
          },
        },
        {
          id: {
            not: uniqueID,
          },
        },
      ],
    },
    select: {
      /* 
        This id will be on the line
        not within the Fifo column itself
      */
      id: true,
      Fifo: true,
      LevelFifo: true,
    },
    take: 1,
  });

  console.log(findFifoTransactions);
}
