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
  const msDelay = 800; // ms

  try {
    lib.ff.register(funcDefs);

    // repeat fja1, fja4, fja3 5x times
    const output = await lib.ff.repeatAnyFunction(input, [0, 3, 2], 5, 700, debug); // repeat 5 times with delay of 700 ms after each iteration

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
 -------------- 1. (700) repeatAnyFunction { i: 1, x: 5 }
fja1 5
--- fja1 --- [0](700) fja1 -> 6

fja4 6
--- fja4 --- [3](700) fja4 -> 7

fja3 7
--- fja3 --- [2](700) fja3 -> 8


-------------- 2. (700) repeatAnyFunction { i: 2, x: 8 }
fja1 8
--- fja1 --- [0](700) fja1 -> 9

fja4 9
--- fja4 --- [3](700) fja4 -> 10

fja3 10
--- fja3 --- [2](700) fja3 -> 11


-------------- 3. (700) repeatAnyFunction { i: 3, x: 11 }
fja1 11
--- fja1 --- [0](700) fja1 -> 12

fja4 12
--- fja4 --- [3](700) fja4 -> 13

fja3 13
--- fja3 --- [2](700) fja3 -> 14


-------------- 4. (700) repeatAnyFunction { i: 4, x: 14 }
fja1 14
--- fja1 --- [0](700) fja1 -> 15

fja4 15
--- fja4 --- [3](700) fja4 -> 16

fja3 16
--- fja3 --- [2](700) fja3 -> 17


-------------- 5. (700) repeatAnyFunction { i: 5, x: 17 }
fja1 17
--- fja1 --- [0](700) fja1 -> 18

fja4 18
--- fja4 --- [3](700) fja4 -> 19

fja3 19
--- fja3 --- [2](700) fja3 -> 20

RES::  20
 */

