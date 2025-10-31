const items = [
    { name: 'Bike', price: 100 },
    { name: 'TV', price: 200 },
    { name: 'Album', price: 10 },
    { name: 'Book', price: 5 },
    { name: 'Phone', price: 500 },
    { name: 'Computer', price: 2000 },
    { name: 'Keyboard', price: 25 },
];
console.log(items);
console.log(items.length);
console.log(items[5].price);
// findIndex
console.log(items.findIndex(item => item.name === 'Computer'));
// destructuration
const [a, b, c] = items;
console.log(a, b, c);
// push
items.push({ name: 'Mouse', price: 60 });
console.log(items);
// pop
items.pop();
console.log("items.pop()");
console.log(items);
// shift
items.shift();
console.log(items);
// splice
items.splice(2, 2);
console.log(items);

// foreach
items.forEach(item => console.log(item.name + ' ' + item.price + '$'));
// sort
items.sort((a, b) => a.name > b.name ? 1 : -1);
console.log(items);
// copier et trier
const sortedPrices = [...items].sort((a, b) => a.price > b.price ? 1 : -1);
console.log(sortedPrices)
// filter
const filteredItems = items.filter(item => item.price <= 100);
console.log(filteredItems);
// map
const itemsNames = items.map(item => item.name);
console.log(itemsNames);
// find
const foundItem = items.find(item => item.name === 'Computer');
console.log(foundItem);
// some
const hasNotExpensive = items.some(item => item.price <= 100);
console.log(hasNotExpensive);
const hasFreeItems = items.some(item => item.price === 0);
console.log(hasFreeItems);
// every 
const under2000 = items.every(item => item.price <= 2000);
console.log(under2000);
// reduce
const total = items.reduce((currentTotal, item) => { return item.price + currentTotal }, 0);
console.log(total);
// includes
const numbers = [1, 3, 5, 7, 9, 11];
const included = numbers.includes(6);
console.log(included)