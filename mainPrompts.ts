const { NumberPrompt } = require("enquirer");
import { columnPrompt } from "./functions/columnFunctions";
import { tablePrompt } from "./functions/tableFunctions";

export function mainPrompt() {
  //The Prompt funtion is designed to bring a user through a series of questions in the right order so that they calc excute, update, delete table in the proper order of operations

  console.clear();
  console.log("Please enter the number for your selection");
  console.log("0...Column prompts");
  console.log("1...Table prompts");

  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter a number",
  });

  prompt.run().then(function (answer) {
    if (answer === 0) {
      columnPrompt();
    }
    if (answer === 1) {
      tablePrompt();
    }
  });
}
////----end of mainPrompt function---------------------------------------

mainPrompt();
