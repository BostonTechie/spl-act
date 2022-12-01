import prisma from "../prisma/client";

/* 
    Below function lets 
    the user pass in a token name
*/
export async function findSPLManyTokenType(
  tokenName,
  accountName,
  selectId,
  returnNumofResults
) {
  let findTransaction = await prisma.sPL.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      Token: tokenName,
      Account: accountName,
    },
    select: {
      id: selectId,
    },
    take: returnNumofResults,
  });

  return findTransaction;
}
