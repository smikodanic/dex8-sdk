const Rand = require('./Rand');
const rand = new Rand();

for (let i = 1; i <= 100; i++) {
  console.log(rand.integerBetween(5000, 8000));
}


// for (let i = 1; i <= 100; i++) {
//   console.log(rand.floatBetween(5.000, 5.02533, 3));
// }


// const arr = ['a', 12, 'b', 22, 'c', false];
// const arr2 = rand.shuffleArray(arr);
// console.log(arr2);

