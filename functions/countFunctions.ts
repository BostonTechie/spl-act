import prisma from "../prisma/client";
import {
  findSplIdsFunc,
  findAllAccountsFunc,
  findAllTokensFunc,
} from "./findFunctions";
/* 
        global variables
    */
let promiseAccountsGlobal = findAllAccountsFunc();
let promiseTokensGlobal = findAllTokensFunc();

export async function countTransactions(tokenName, accountName) {
  /* 
    count the number of
    transactions given the parameters
 */
  let countTrans = await prisma.sPL.count({
    where: {
      Token: tokenName,
      Account: accountName,
    },
  });

  return countTrans;
}
async function fifoCalcRealized(countTransactions) {
  /* 
   Find the count of all Account,
   Token combinations not have at least
   one value, break those into large, versus
   small types
  */

  let findAllAccounts = await promiseAccountsGlobal;
  let findAllTokens = await promiseTokensGlobal;

  let smallI = 0;
  let bigI = 0;

  for (let account of findAllAccounts) {
    for (let token of findAllTokens) {
      if (bigI === 5) {
        // reset i to send to specific function
        bigI = 0;
      }
      if (smallI === 5) {
        // reset i to send to specific function
        smallI = 0;
      }

      let countTrans = await prisma.sPL.count({
        where: {
          Token: token.Token,
          Account: account.Account,
        },
      });

      if (countTrans != 0) {
        if (countTrans != 0) {
          if (countTrans >= 250000) {
            let largeTObject = {
              i: bigI,
              count: countTrans,
              account: account.Account,
              token: token.Token,
            };

            console.log(largeTObject);
            bigI++;
          } else {
            let smallTObject = {
              i: smallI,
              count: countTrans,
              account: account.Account,
              token: token.Token,
            };
            console.log(smallTObject);
            smallI++;
          }
        }
      }
    }
  }
}
