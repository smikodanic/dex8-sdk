const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); lib.ff.jumpFunction(10, true); return x + 1;'}, // jump to index 10 of array [0, 1, 2, 1, 2, 3, 4, 2, 3, 9, 5, 3, 6, 3] what is 5 e.g. fja6
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'},
  {name: 'fja7', body: 'console.log(\'fja7\', x); return x + 1;'},
  {name: 'fja8', body: 'console.log(\'fja8\', x); return x + 1;'},
  {name: 'fja9', body: 'console.log(\'fja9\', x); return x + 1;'},
  {name: 'fja10', body: 'console.log(\'fja10\', x); return x + 1;'},
];



const main = async (input, lib) => {
  const debug = true;
  const msDelay = 2000; // ms

  try {
    lib.ff.register(funcDefs);
    lib.ff.libInject(lib); // now you can use "lib" in functions, for example: lib.ff.jumpFunction(10, true);

    const output = await lib.ff.serialAny(input, [0, 1, 2, 1, 2, 3, 4, 2, 3, 9, 5, 3, 6, 3], msDelay, debug);
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
 *
fja1 5
--- serialAny --- [0](2000) fja1 -> 6

fja2 6
   ===JUMP to function i:10===
--- serialAny --- [1](2000) fja2 -> 7

fja6 7
--- serialAny --- [5](2000) fja6 -> 8

fja4 8
--- serialAny --- [3](2000) fja4 -> 9

fja7 9
--- serialAny --- [6](2000) fja7 -> 10

fja4 10
--- serialAny --- [3](2000) fja4 -> 11

RES::  11

 */

