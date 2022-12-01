import prisma from "../prisma/client";

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
