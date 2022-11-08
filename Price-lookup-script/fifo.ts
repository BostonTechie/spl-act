import prisma from "../prisma/client";

async function main() {
  const calcSumOfBuyTokenandWallet = await prisma.sPL.findMany({
    where: {
      Token: "DEC",
      Account: "Aggroed-spl",
      Buy: "BUY",
    },
    select: {
      id: true,
      Created_Date: true,
      Amount: true,
    },
  });

  console.log(calcSumOfBuyTokenandWallet);
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
