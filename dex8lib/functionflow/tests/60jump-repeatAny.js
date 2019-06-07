const FunctionFlow = require('../FunctionFlow');
const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'}
];

try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}


async function main(ff) {
  const debug = true;
  const input = 5;

  // JUMP to repeat iteration
  setTimeout(function () {
    ff.jump(5, 'repeat', debug); // jump to 5.rd iteration (last iteration)
  }, 2500);


  const output = await ff.repeatAny(input, [0, 3, 3, 2, 1, 3], 5, 400, debug); // repeat 5 times with delay of 400 ms after each iteration
  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));



/*
 * Notice: Jump to last iteration. Iterations 3 and 4 are not executed.

-------------- 1. (400) repeatAny { i: 1, x: 5 }
fja1 5
--- fja1 --- [0](400) fja1 -> 6

fja4 6
--- fja4 --- [3](400) fja4 -> 7

fja4 7
--- fja4 --- [3](400) fja4 -> 8

fja3 8
--- fja3 --- [2](400) fja3 -> 9

fja2 9
--- fja2 --- [1](400) fja2 -> 10

fja4 10
--- fja4 --- [3](400) fja4 -> 11


-------------- 2. (400) repeatAny { i: 2, x: 11 }
fja1 11
--- fja1 --- [0](400) fja1 -> 12

=== JUMP to repeat 5 ===
fja4 12
--- fja4 --- [3](400) fja4 -> 13

fja4 13
--- fja4 --- [3](400) fja4 -> 14

fja3 14
--- fja3 --- [2](400) fja3 -> 15

fja2 15
--- fja2 --- [1](400) fja2 -> 16

fja4 16
--- fja4 --- [3](400) fja4 -> 17


-------------- 5. (400) repeatAny { i: 5, x: 17 }
fja1 17
--- fja1 --- [0](400) fja1 -> 18

fja4 18
--- fja4 --- [3](400) fja4 -> 19

fja4 19
--- fja4 --- [3](400) fja4 -> 20

fja3 20
--- fja3 --- [2](400) fja3 -> 21

fja2 21
--- fja2 --- [1](400) fja2 -> 22

fja4 22
--- fja4 --- [3](400) fja4 -> 23

RES::  23


*/
