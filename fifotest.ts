let linkedList = require("fifo")();

linkedList.push({ time: "12 / 31 / 14", value: 4, amount: 10 });
linkedList.push({ time: "12 / 31 / 15", value: 4, amount: 20 });
linkedList.push({ time: "12 / 31 / 16", value: 4, amount: 30 });
linkedList.push({ time: "12 / 31 / 17", value: 4, amount: 40 });

for (let node = linkedList.node; node; node = linkedList.next(node)) {
  console.log("value is", node.value);
}

console.log(linkedList.node.value.amount);
