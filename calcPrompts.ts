import prisma from "./prisma/client";
const { Confirm } = require("enquirer");
import { deleteTokenTable, deleteAccountTable } from "./functions/deleteTable";
import { tableNames } from "./functions/tableNames";

async function main() {
  //The Prompt funtion is designed to bring a user through a series of questions in the right order so that they calc excute, update, delete table in the proper order of operations

  //Would the user like to update find and update the price history for the transactions imported into the database?

  const findHistoryPrices = new Confirm({
    delete: "question",
    message:
      "In order for any scripts to run properly at a minimum the history of the crypto transactions must be imported into the SPL table, addtionally, the price history of the various tokens must be imported into their respective tables...continue? (y/N) ",
  });

  findHistoryPrices.run().then(function (answer) {
    if (answer === true) {
      tableNames();
    } else console.log(answer, "fail");
  });

  const deletePrompt = new Confirm({
    delete: "question",
    message: "Would you like to Truncate the Token table?",
  });

  deletePrompt.run().then(function (answer) {
    if (answer === true) {
      deleteTokenTable();
    } else console.log(answer, "fail");
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect;
  });
