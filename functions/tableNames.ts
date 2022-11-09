import prisma from "../prisma/client";

//updates the buy or sell column in the SPL database for FIFO calc purposes
export async function tableNames() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  console.log(tablenames);
}
