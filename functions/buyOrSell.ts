import prisma from "../prisma/client";

//updates the buy or sell column in the SPL database for FIFO calc purposes
export async function updateBySellColumn() {
  await prisma.sPL.updateMany({
    where: {
      Amount: {
        gt: 0,
      },
    },
    data: {
      Buy_or_Sell: "Buy",
    },
  });

  await prisma.sPL.updateMany({
    where: {
      Amount: {
        lte: 0,
      },
    },
    data: {
      Buy_or_Sell: "Sell",
    },
  });
}
