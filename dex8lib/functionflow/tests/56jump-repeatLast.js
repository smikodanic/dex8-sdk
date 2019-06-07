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
    ff.jump(3, 'repeat', debug); // jump to 3.rd repeat (iteration)
  }, 5000);

  let x;
  x = await ff.serialRange(input, 1, 2, 100, debug);
  x = await ff.serialAll(x, 800, debug);
  x = await ff.repeatLast(x, 4, 1000, debug); // 4 repeats of serialAll with delay 1000ms

  const output = x;
  return output;
}


main(ff)
  .then(res => {
    console.log('RES:: ', res);
    //process.exit(1);
  })
  .catch(err => console.error('ERR:: ', err));




/**
Notice: repeatLast jumped 2. iteration


fja2 5
--- serialRange --- [1](100) fja2 -> 6

fja3 6
--- serialRange --- [2](100) fja3 -> 7

fja1 7
--- serialAll --- [0](800) fja1 -> 8

fja2 8
--- serialAll --- [1](800) fja2 -> 9

fja3 9
--- serialAll --- [2](800) fja3 -> 10

fja4 10
--- serialAll --- [3](800) fja4 -> 11


-------------- 1. (1000) repeatLast/serialAll [ 5, 800, true ]
fja1 5
--- serialAll --- [0](800) fja1 -> 6

fja2 6
--- serialAll --- [1](800) fja2 -> 7

=== JUMP to repeat 3 ===
fja3 7
--- serialAll --- [2](800) fja3 -> 8

fja4 8
--- serialAll --- [3](800) fja4 -> 9


-------------- 3. (1000) repeatLast/serialAll [ 9, 800, true ]
fja1 9
--- serialAll --- [0](800) fja1 -> 10

fja2 10
--- serialAll --- [1](800) fja2 -> 11

fja3 11
--- serialAll --- [2](800) fja3 -> 12

fja4 12
--- serialAll --- [3](800) fja4 -> 13


-------------- 4. (1000) repeatLast/serialAll [ 13, 800, true ]
fja1 13
--- serialAll --- [0](800) fja1 -> 14

fja2 14
--- serialAll --- [1](800) fja2 -> 15

fja3 15
--- serialAll --- [2](800) fja3 -> 16

fja4 16
--- serialAll --- [3](800) fja4 -> 17

RES::  17


 */
