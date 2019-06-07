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

  // PAUSE
  setTimeout(function () {
    ff.pause(true);
  }, 3000);

  // reSTART
  setTimeout(function () {
    ff.start(true);
  }, 8000);

  // STOP
  setTimeout(function () {
    ff.stop(true);
  }, 13000);


  const output = await ff.repeatFor({method: 'serialRange', args: [input, 0, 2, 500, debug]}, 100, 1000, debug); // 100 repeats
  return output;
}


main(ff)
  .then(res => {
    console.log('RES:: ', res);
    //process.exit(1);
  })
  .catch(err => console.error('ERR:: ', err));




/**
Notice: repeatFor is stopped in 4.th iteration e.g. before defined 100.th iteration


-------------- 1. (1000) repeatFor/serialRange 5 0 2 500 true { i: 1, x: null }
fja1 5
--- serialRange --- [0](500) fja1 -> 6

fja2 6
--- serialRange --- [1](500) fja2 -> 7

fja3 7
--- serialRange --- [2](500) fja3 -> 8


-------------- 2. (1000) repeatFor/serialRange 8 0 2 500 true { i: 1, x: 8 }
fja1 8
--- serialRange --- [0](500) fja1 -> 9

=== PAUSE ===
=== START ===
fja2 9
--- serialRange --- [1](500) fja2 -> 10

fja3 10
--- serialRange --- [2](500) fja3 -> 11


-------------- 3. (1000) repeatFor/serialRange 11 0 2 500 true { i: 2, x: 11 }
fja1 11
--- serialRange --- [0](500) fja1 -> 12

fja2 12
--- serialRange --- [1](500) fja2 -> 13

fja3 13
--- serialRange --- [2](500) fja3 -> 14


-------------- 4. (1000) repeatFor/serialRange 14 0 2 500 true { i: 3, x: 14 }
fja1 14
--- serialRange --- [0](500) fja1 -> 15

=== STOP ===
RES::  15

 */
