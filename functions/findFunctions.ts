import prisma from "../prisma/client";

export async function findSplIdsFunc(
  tokenName,
  accountName,
  returnNumofResults
) {
  /* 
     Below function lets 
     the user pass in:
     ONE token name,
     ONE account name,
     and the number of results they would like
     then the function returns the unique
     ids found in the Database
 */
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

export async function findAllAccountsFunc() {
  const findAllAccounts = await prisma.listing_Account.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      Account: true,
    },
  });

  return findAllAccounts;
}

export async function findAllTokensFunc() {
  const findAllTokens = await prisma.listing_Token.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      Token: true,
    },
  });

  return findAllTokens;
}
