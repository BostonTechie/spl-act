import prisma from "../prisma/client";

//delete the token table
export async function deleteTokenTable() {
  await prisma.listing_Token.deleteMany({});
  console.log("token table listing deleted export");
}

//delete the account table
export async function deleteAccountTable() {
  await prisma.listing_Account.deleteMany({});
  console.log("Distinct account table listing deleted");
}
