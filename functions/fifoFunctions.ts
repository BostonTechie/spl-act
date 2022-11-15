import prisma from "../prisma/client";
const { NumberPrompt, Confirm } = require("enquirer");
import { mainPrompt } from "../mainPrompts";

export function fifoPrompt() {
  //controls the console prompting in this page
  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter the number for your selection",
  });

  console.log("Please enter one of the following options");
  console.log("0...Truncate distinct tokens.. table name: 'Listing_Token' ");
  console.log("1...Truncate distinct accounts.. table name: 'Listing_Account'");
  console.log("2... \u{1F36A} Truncate & rerun  'Listing_Token'Table ");
  console.log("3... \u{1F36A} Truncate & rerun  'Listing_Account'");
  console.log("4... List name of all tables in the DB");
  console.log("9...back");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      deleteTokenTable();
    }
    if (answer === 1) {
      deleteAccountTable();
    }
    if (answer === 2) {
      deleteTokenTable();
      generateListingToken();
    }
    if (answer === 3) {
      deleteAccountTable();
      generateListingAccount();
    }
    if (answer === 4) {
      tableNames();
    }
    if (answer === 9) {
      mainPrompt();
    }
  });
}
