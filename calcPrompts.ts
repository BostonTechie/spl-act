const { NumberPrompt } = require("enquirer");
import { columnCalcsFunc } from "./functions/columnCalcs";

export async function mainPrompt() {
  //The Prompt funtion is designed to bring a user through a series of questions in the right order so that they calc excute, update, delete table in the proper order of operations

  const prompt = new NumberPrompt({
    name: "number",
    message: "Please enter a number",
  });

  console.log("Please enter one of the following options");
  console.log("0...column calculation scripts");
  console.log("1...truncate table");
  prompt.run().then(function (answer) {
    if (answer === 0) {
      columnCalcsFunc();
    }
  });
}
////----end of mainPrompt function---------------------------------------

mainPrompt().catch((e) => {
  console.error(e);
  process.exit(1);
});
