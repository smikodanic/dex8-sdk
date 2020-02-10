const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();

const fs = require('fs');
const util = require('util');

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: `
    console.log('fja3', x);
    console.log('++++++++++++++++++ ', lib.util.inspect(lib.fs.realpathSync));
    return x + 1;
  `},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'}
];



const main = async (input, lib) => {
  const debug = true;
  const msDelay = 800; // ms

  try {
    lib.ff.register(funcDefs);
    ff.libInject({fs, util});

    const output = await ff.repeatMethod({method: 'serialRange', args: [input, 1, 2, msDelay, debug]}, 3, 1300, debug); // repeat 3 times with delay of 1300 ms after each iteration
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

-------------- 1. (1300) repeatMethod/serialRange [ 5, 1, 2, 800, true ] { i: 0, x: null }
fja2 5
--- serialRange --- [1](800) fja2 -> 6

fja3 6
++++++++++++++++++  [Function: realpathSync] { native: [Function] }
--- serialRange --- [2](800) fja3 -> 7


-------------- 2. (1300) repeatMethod/serialRange [ 7, 1, 2, 800, true ] { i: 1, x: 7 }
fja2 7
--- serialRange --- [1](800) fja2 -> 8

fja3 8
++++++++++++++++++  [Function: realpathSync] { native: [Function] }
--- serialRange --- [2](800) fja3 -> 9


-------------- 3. (1300) repeatMethod/serialRange [ 9, 1, 2, 800, true ] { i: 2, x: 9 }
fja2 9
--- serialRange --- [1](800) fja2 -> 10

fja3 10
++++++++++++++++++  [Function: realpathSync] { native: [Function] }
--- serialRange --- [2](800) fja3 -> 11

RES::  11

 */
