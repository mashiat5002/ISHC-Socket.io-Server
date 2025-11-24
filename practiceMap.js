const practiceMap = new Map();

practiceMap.set("apple", { quantity: 5, price: 1.2 });
practiceMap.set("banana", { quantity: 2, price: 0.8 });
practiceMap.set("orange", { quantity: 3, price: 1.0 });
practiceMap.set("grape", { quantity: 4, price: 2.5 });
practiceMap.set("kiwi", { quantity: 6, price: 1.5 });
practiceMap.delete("banana"); // Remove banana from the map
console.log(practiceMap)


