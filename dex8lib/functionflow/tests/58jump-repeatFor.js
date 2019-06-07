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
    ff.jump(8, 'repeat', debug); // jump to 8.th iteration
  }, 3000);

  const output = await ff.repeatFor({method: 'serialRange', args: [input, 0, 2, 500, debug]}, 10, 1000, debug); // 10 iterations
  return output;
}


main(ff)
  .then(res => {
    console.log('RES:: ', res);
    //process.exit(1);
  })
  .catch(err => console.error('ERR:: ', err));




/**
Notice: repeatFor is jumped to 8.th iteration

-------------- 1. (1000) repeatFor/serialRange [ 5, 0, 2, 500, true ] { i: 1, x: null }
fja1 5
--- serialRange --- [0](500) fja1 -> 6

fja2 6
--- serialRange --- [1](500) fja2 -> 7

fja3 7
--- serialRange --- [2](500) fja3 -> 8


-------------- 2. (1000) repeatFor/serialRange [ 8, 0, 2, 500, true ] { i: 1, x: 8 }
fja1 8
--- serialRange --- [0](500) fja1 -> 9

=== JUMP to repeat 8 ===
fja2 9
--- serialRange --- [1](500) fja2 -> 10

fja3 10
--- serialRange --- [2](500) fja3 -> 11


-------------- 8. (1000) repeatFor/serialRange [ 11, 0, 2, 500, true ] { i: 2, x: 11 }
fja1 11
--- serialRange --- [0](500) fja1 -> 12

fja2 12
--- serialRange --- [1](500) fja2 -> 13

fja3 13
--- serialRange --- [2](500) fja3 -> 14


-------------- 9. (1000) repeatFor/serialRange [ 14, 0, 2, 500, true ] { i: 8, x: 14 }
fja1 14
--- serialRange --- [0](500) fja1 -> 15

fja2 15
--- serialRange --- [1](500) fja2 -> 16

fja3 16
--- serialRange --- [2](500) fja3 -> 17


-------------- 10. (1000) repeatFor/serialRange [ 17, 0, 2, 500, true ] { i: 9, x: 17 }
fja1 17
--- serialRange --- [0](500) fja1 -> 18

fja2 18
--- serialRange --- [1](500) fja2 -> 19

fja3 19
--- serialRange --- [2](500) fja3 -> 20

RES::  20

 */
