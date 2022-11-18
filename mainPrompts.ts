const { NumberPrompt } = require("enquirer");
import { columnPrompt } from "./functions/columnFunctions";
import { tablePrompt } from "./functions/tableFunctions";
import { fifoPrompt } from "./functions/fifoFunctions";
import { JsonPrompt } from "./functions/test";

export function mainPrompt() {
  /*
  The Prompt funtion is designed to bring a user 
  through a series of questions in the right order lower
  numbered prompts must be complete before higher number
  prompts (0 before 1)
   so that they calc excute, update, delete table in the proper 
   order of operations
  */

  console.clear();
  console.log("Please enter the number for your selection");
  console.log("0...Column prompts");
  console.log("1...Table prompts");
  console.log("2...FIFO prompts");
  console.log("3...test prompts");

  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter a number",
  });

  prompt.run().then(function (answer) {
    if (answer === 0) {
      answer = null;
      columnPrompt();
    }
    if (answer === 1) {
      answer = null;
      tablePrompt();
    }
    if (answer === 2) {
      answer = null;
      fifoPrompt();
    }
    if (answer === 3) {
      answer = null;
      JsonPrompt();
    }
  });
}
////----end of mainPrompt function---------------------------------------

mainPrompt();
