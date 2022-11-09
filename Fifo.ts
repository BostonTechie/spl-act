import prisma from "./prisma/client";

async function main() {
  const calcSumOfBuyTokenandWallet = await prisma.sPL.findMany({
    where: {
      Token: "DEC",
      Account: "Aggroed-spl",
      Buy: "Buy",
    },
    select: {
      id: true,
      Created_Date: true,
      Amount: true,
    },
  });

  console.log(calcSumOfBuyTokenandWallet, "hi there");

  let idAmount = 0;
  let currentSumAmount = 0;
  let previousSumAmount = 0;

  for (const uniqueID of calcSumOfBuyTokenandWallet) {
    previousSumAmount = currentSumAmount;
    currentSumAmount = currentSumAmount + uniqueID.Amount;

    const update = await prisma.sPL.update({
      where: {
        id: uniqueID.id,
      },
      data: {
        Cumulative_Buy: currentSumAmount,
      },
    });
  }
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
