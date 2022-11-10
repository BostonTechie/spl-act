import prisma from "../prisma/client";

//gives a listing of tables that currently exist in the current database configured in the .ENV file
export async function tableNames() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  console.log(tablenames);
}
