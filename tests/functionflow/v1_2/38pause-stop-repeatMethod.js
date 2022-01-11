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
      lib.ff.pause(true);
    }, 3000);

    // reSTART
    setTimeout(function () {
      lib.ff.start(true);
    }, 8000);

    // STOP
    setTimeout(function () {
      lib.ff.stop(true);
    }, 13000);


    const output = await lib.ff.repeatMethod({method: 'serialRange', args: [input, 0, 2, 100, debug]}, 100, 1000, debug); // 100 repeats
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









/**
Notice: repeatMethod is stopped in 7.th iteration e.g. before defined 100.th iteration

-------------- 1. (1000) repeatMethod/serialRange [ 5, 0, 2, 100, true ] { i: 0, x: null }
fja1 5
--- serialRange --- [0](100) fja1 -> 6

fja2 6
--- serialRange --- [1](100) fja2 -> 7

fja3 7
--- serialRange --- [2](100) fja3 -> 8


-------------- 2. (1000) repeatMethod/serialRange [ 8, 0, 2, 100, true ] { i: 1, x: 8 }
fja1 8
--- serialRange --- [0](100) fja1 -> 9

fja2 9
--- serialRange --- [1](100) fja2 -> 10

fja3 10
--- serialRange --- [2](100) fja3 -> 11


-------------- 3. (1000) repeatMethod/serialRange [ 11, 0, 2, 100, true ] { i: 2, x: 11 }
fja1 11
--- serialRange --- [0](100) fja1 -> 12

fja2 12
--- serialRange --- [1](100) fja2 -> 13

fja3 13
--- serialRange --- [2](100) fja3 -> 14

   ===pause===
   ===start===

-------------- 4. (1000) repeatMethod/serialRange [ 14, 0, 2, 100, true ] { i: 3, x: 14 }
fja1 14
--- serialRange --- [0](100) fja1 -> 15

fja2 15
--- serialRange --- [1](100) fja2 -> 16

fja3 16
--- serialRange --- [2](100) fja3 -> 17


-------------- 5. (1000) repeatMethod/serialRange [ 17, 0, 2, 100, true ] { i: 4, x: 17 }
fja1 17
--- serialRange --- [0](100) fja1 -> 18

fja2 18
--- serialRange --- [1](100) fja2 -> 19

fja3 19
--- serialRange --- [2](100) fja3 -> 20


-------------- 6. (1000) repeatMethod/serialRange [ 20, 0, 2, 100, true ] { i: 5, x: 20 }
fja1 20
--- serialRange --- [0](100) fja1 -> 21

fja2 21
--- serialRange --- [1](100) fja2 -> 22

fja3 22
--- serialRange --- [2](100) fja3 -> 23


-------------- 7. (1000) repeatMethod/serialRange [ 23, 0, 2, 100, true ] { i: 6, x: 23 }
fja1 23
--- serialRange --- [0](100) fja1 -> 24

fja2 24
--- serialRange --- [1](100) fja2 -> 25

fja3 25
--- serialRange --- [2](100) fja3 -> 26

   ===stop===
RES::  26


 */
