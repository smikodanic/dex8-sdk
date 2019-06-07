const Randomize = require('./Randomize');
const randomize = new Randomize();

for (let i = 1; i <= 100; i++) {
  console.log(randomize.integerBetween(5000, 8000));
}


// for (let i = 1; i <= 100; i++) {
//   console.log(randomize.floatBetween(5.000, 5.02533, 3));
// }


// const arr = ['a', 12, 'b', 22, 'c', false];
// const arr2 = randomize.shuffleArray(arr);
// console.log(arr2);

