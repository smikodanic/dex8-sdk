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

  try {
    lib.ff.register(funcDefs);

    // JUMP to repeat iteration
    setTimeout(() => {
      lib.ff.jumpRepeat(8, debug); // jump to 8.th iteration
    }, 3000);

    const output = await lib.ff.repeatMethod({method: 'serialRange', args: [input, 0, 2, 500, debug]}, 10, 1000, debug); // 10 iterations total
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

-------------- 1. (1000) repeatMethod/serialRange [ 5, 0, 2, 500, true ] { i: 0, x: null }
fja1 5
--- serialRange --- [0](500) fja1 -> 6

fja2 6
--- serialRange --- [1](500) fja2 -> 7

fja3 7
--- serialRange --- [2](500) fja3 -> 8


-------------- 2. (1000) repeatMethod/serialRange [ 8, 0, 2, 500, true ] { i: 1, x: 8 }
fja1 8
--- serialRange --- [0](500) fja1 -> 9

   ===JUMP to repeat iteration i:8===
fja2 9
--- serialRange --- [1](500) fja2 -> 10

fja3 10
--- serialRange --- [2](500) fja3 -> 11


-------------- 8. (1000) repeatMethod/serialRange [ 11, 0, 2, 500, true ] { i: 2, x: 11 }
fja1 11
--- serialRange --- [0](500) fja1 -> 12

fja2 12
--- serialRange --- [1](500) fja2 -> 13

fja3 13
--- serialRange --- [2](500) fja3 -> 14


-------------- 9. (1000) repeatMethod/serialRange [ 14, 0, 2, 500, true ] { i: 8, x: 14 }
fja1 14
--- serialRange --- [0](500) fja1 -> 15

fja2 15
--- serialRange --- [1](500) fja2 -> 16

fja3 16
--- serialRange --- [2](500) fja3 -> 17


-------------- 10. (1000) repeatMethod/serialRange [ 17, 0, 2, 500, true ] { i: 9, x: 17 }
fja1 17
--- serialRange --- [0](500) fja1 -> 18

fja2 18
--- serialRange --- [1](500) fja2 -> 19

fja3 19
--- serialRange --- [2](500) fja3 -> 20

RES::  20

 */
