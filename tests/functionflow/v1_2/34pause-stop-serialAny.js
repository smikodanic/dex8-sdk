const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
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

    // PAUSE
    setTimeout(function () {
      lib.ff.pause(true);
    }, 3000);

    // reSTART
    setTimeout(function () {
      lib.ff.start(true);
    }, 8000);

    // STOP
    setTimeout(function () {
      lib.ff.stop(true);
    }, 15000);

    let x;
    x = await lib.ff.serialAny(input, [0, 1, 2, 2, 2, 3, 4, 2, 3, 9, 5, 3, 6, 3], msDelay, debug);
    x = await lib.ff.serialAll(x, msDelay, debug); // will not execute all functions due to STOP
    x = await lib.ff.one(x, 1, msDelay, debug); // will not execute fja2 due to STOP

    return x;
  } catch(err) {
    throw err;
  }
};



const inp = 5;
const lib = {ff};

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));







/**
 * Notice: serialAny is stopped after 15 seconds, at fja4, so end of function array is never reached.

fja1 5
--- serialAny --- [0](2000) fja1 -> 6

fja2 6
--- serialAny --- [1](2000) fja2 -> 7

   ===pause===
   ===start===
fja3 7
--- serialAny --- [2](2000) fja3 -> 8

fja3 8
--- serialAny --- [2](2000) fja3 -> 9

fja3 9
--- serialAny --- [2](2000) fja3 -> 10

fja4 10
--- serialAny --- [3](2000) fja4 -> 11

   ===stop===
RES::  11


 */

