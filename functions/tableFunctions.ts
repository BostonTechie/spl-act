import prisma from "../prisma/client";
const { NumberPrompt, Confirm } = require("enquirer");
import { mainPrompt } from "../mainPrompts";

export function tablePrompt() {
  let answer = null;
  //controls the console prompting in this page
  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter the number for your selection",
  });

  answer = null;
  console.log("Please enter one of the following options");
  console.log("0...Truncate distinct tokens.. table name: 'Listing_Token' ");
  console.log("1...Truncate distinct accounts.. table name: 'Listing_Account'");
  console.log("2... \u{1F36A} Truncate & rerun  'Listing_Token'Table ");
  console.log("3... \u{1F36A} Truncate & rerun  'Listing_Account'");
  console.log("4... List name of all tables in the DB");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      answer = null;
      deleteTokenTable();
    }
    if (answer === 1) {
      answer = null;
      deleteAccountTable();
    }
    if (answer === 2) {
      answer = null;
      deleteTokenTable().then;
      generateListingToken();
    }
    if (answer === 3) {
      answer = null;
      deleteAccountTable().then;
      generateListingAccount();
    }
    if (answer === 4) {
      answer = null;
      tableNames();
    }
    if (answer === 9) {
      answer = null;
      mainPrompt();
    }
  });
}

async function deleteTokenTable() {
  //delete the token table which is used to calc Fifo
  await prisma.listing_Token.deleteMany({});
  console.log("👍👍👍 Truncate Listing_Token table complete");
  tablePrompt();
}

async function deleteAccountTable() {
  /*
  delete the Listing_Account table, which is used to
  determine what is internal vs. external...see columnFunctions.ts
  */
  await prisma.listing_Account.deleteMany({});
  console.log("👍👍👍 Truncate Listing_Account table complete");
  tablePrompt();
}

async function generateListingAccount() {
  /*
    generate table that lists all of the distinct 
    accounts and put into the "Listing_Account" 
    table in the database, which is used to determine what
    is internal vs. external...see columnFunctions.ts
  */

  const distinctAccount = await prisma.sPL.findMany({
    select: {
      Account: true,
    },
    distinct: ["Account"],
  });
  await prisma.listing_Account.createMany({
    data: distinctAccount,
  });

  console.log(
    "here are your distinct accounts, table updated with:, ",
    distinctAccount
  );
  tablePrompt();
}

async function generateListingToken() {
  //generate table that lists all of the distinct tokenss and put into the "Listing_Table" table in the database...this table is utilized to calc FIFO
  const distinctAccount = await prisma.sPL.findMany({
    select: {
      Token: true,
    },
    distinct: ["Token"],
  });
  await prisma.listing_Token.createMany({
    data: distinctAccount,
  });

  console.log(
    "here are your distinct accounts, table updated with:, ",
    distinctAccount
  );
  tablePrompt();
}

async function tableNames() {
  /*
    gives a listing of tables that 
    currently exist in the current database
    configured in the .ENV file
  */

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  console.log(tablenames);
  const prompt = new Confirm({
    name: "question",
    message: "Want to go back to Main prompt?",
  });

  prompt
    .run()
    .then(function (answer) {
      if (answer === true) {
        mainPrompt();
      } else tablePrompt();
    })
    .catch(console.error);
}
