var fifo = require("fifo")();

fifo.push({ time: 12 / 31 / 14, value: 4, amount: 43 });
fifo.push(2);

console.log(fifo.first(), "1"); // prints hello
console.log(fifo.last(), "2"); // prints world

console.log(fifo.shift(), "3"); // Removes the first node and returns the value hello
console.log(fifo.shift(), "4"); // Removes the first node and returns the value world

var node = fifo.push(3);

console.log(fifo.last(), "5");

fifo.remove(node); // remove 'meh' from the stack

console.log(fifo.last(), "6");

fifo.unshift({ time: 12 / 31 / 14, value: 4, amount: 43 }); // Inserts a value at the beginning of the list

for (var node = fifo.node; node; node = fifo.next(node)) {
  console.log("value is", node.value);
  let myNumber = 4;
  myNumber = myNumber + node.value.amount;
  console.log(myNumber);
}
