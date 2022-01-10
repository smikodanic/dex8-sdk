const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'}
];



const main = async (input, lib) => {
  const debug = true;
  const msDelay = 400; // ms

  try {
    lib.ff.register(funcDefs);

    // JUMP to repeat iteration
    setTimeout(function () {
      lib.ff.jumpRepeat(5, debug); // jump to 5.th iteration (last iteration)
    }, 2500);


    const output = await lib.ff.repeatAnyFunction(input, [0, 3, 3, 2, 1, 3], 5, msDelay, debug); // repeat 5 times with delay of 400 ms after each iteration
    return output;
  } catch(err) {
    throw err;
  }
};



const inp = 5;
const lib = {ff};

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));





/*
 * Notice: Jump to last iteration. Iterations 3 and 4 are not executed.

-------------- 1. (400) repeatAnyFunction { i: 1, x: 5 }
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


-------------- 2. (400) repeatAnyFunction { i: 2, x: 11 }
fja1 11
--- fja1 --- [0](400) fja1 -> 12

   ===JUMP to repeat iteration i:5===
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


-------------- 5. (400) repeatAnyFunction { i: 5, x: 17 }
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
