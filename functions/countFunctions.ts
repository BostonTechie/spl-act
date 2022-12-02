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

export async function noZeroTransactions() {
  let findAllAccounts = await promiseAccountsGlobal;
  let findAllTokens = await promiseTokensGlobal;

  for (let account of findAllAccounts) {
    for (let token of findAllTokens) {
      let countTrans = await prisma.sPL.count({
        where: {
          Token: token.Token,
          Account: account.Account,
        },
      });
      console.log(account, token, countTrans);
    }
  }
}
