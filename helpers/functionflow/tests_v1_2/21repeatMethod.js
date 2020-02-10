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
  const msDelay1 = 800; // ms
  const msDelay2 = 3000; // ms

  try {
    lib.ff.register(funcDefs);

    const output = await lib.ff.repeatMethod({method: 'serialRange', args: [input, 1, 2, msDelay1, debug]}, 5, msDelay2, debug); // repeat 5 times with delay of 3000 ms after each iteration
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
 -------------- 1. (3000) repeatMethod/serialRange [ 5, 1, 2, 800, true ] { i: 0, x: null }
fja2 5
--- serialRange --- [1](800) fja2 -> 6

fja3 6
--- serialRange --- [2](800) fja3 -> 7


-------------- 2. (3000) repeatMethod/serialRange [ 7, 1, 2, 800, true ] { i: 1, x: 7 }
fja2 7
--- serialRange --- [1](800) fja2 -> 8

fja3 8
--- serialRange --- [2](800) fja3 -> 9


-------------- 3. (3000) repeatMethod/serialRange [ 9, 1, 2, 800, true ] { i: 2, x: 9 }
fja2 9
--- serialRange --- [1](800) fja2 -> 10

fja3 10
--- serialRange --- [2](800) fja3 -> 11


-------------- 4. (3000) repeatMethod/serialRange [ 11, 1, 2, 800, true ] { i: 3, x: 11 }
fja2 11
--- serialRange --- [1](800) fja2 -> 12

fja3 12
--- serialRange --- [2](800) fja3 -> 13


-------------- 5. (3000) repeatMethod/serialRange [ 13, 1, 2, 800, true ] { i: 4, x: 13 }
fja2 13
--- serialRange --- [1](800) fja2 -> 14

fja3 14
--- serialRange --- [2](800) fja3 -> 15

RES::  15

 */
