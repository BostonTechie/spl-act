import prisma from "../prisma/client";

/* 
  Below function lets 
  the user pass in:
    token name,
    account name,
    and the number of results they would like
  then the function returns the unique
  ids found in the Database
*/
export async function findSplIds(tokenName, accountName, returnNumofResults) {
  let findTransId = await prisma.sPL.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      Token: tokenName,
      Account: accountName,
    },
    select: {
      id: true,
    },
    take: returnNumofResults,
  });

  return findTransId;
}
