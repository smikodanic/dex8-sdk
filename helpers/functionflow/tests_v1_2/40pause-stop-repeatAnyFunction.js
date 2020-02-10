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
  const msDelay = 600; // ms

  try {
    lib.ff.register(funcDefs);

    // PAUSE
    setTimeout(function () {
      lib.ff.pause(debug);
    }, 3000);

    // reSTART
    setTimeout(function () {
      lib.ff.start(debug);
    }, 8000);

    // STOP
    setTimeout(function () {
      lib.ff.stop(debug);
    }, 13000);

    let x = await lib.ff.repeatAnyFunction(input, [0, 3, 3, 2, 1, 1], 50, 1000, debug); // repeat 50 times with delay of 1000 ms after each iteration
    x = await lib.ff.one(x, 1, 1300, debug); // will not be executed because of STOP

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







/*

-------------- 1. (1000) repeatAnyFunction { i: 1, x: 5 }
fja1 5
--- fja1 --- [0](1000) fja1 -> 6

fja4 6
--- fja4 --- [3](1000) fja4 -> 7

fja4 7
--- fja4 --- [3](1000) fja4 -> 8

   ===pause===
   ===start===
fja3 8
--- fja3 --- [2](1000) fja3 -> 9

fja2 9
--- fja2 --- [1](1000) fja2 -> 10

fja2 10
--- fja2 --- [1](1000) fja2 -> 11


-------------- 2. (1000) repeatAnyFunction { i: 2, x: 11 }
fja1 11
--- fja1 --- [0](1000) fja1 -> 12

fja4 12
--- fja4 --- [3](1000) fja4 -> 13

   ===stop===
RES::  13


*/
