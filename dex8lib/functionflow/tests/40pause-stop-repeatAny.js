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
    ff.pause(debug);
  }, 3000);

  // reSTART
  setTimeout(function () {
    ff.start(debug);
  }, 8000);

  // STOP
  setTimeout(function () {
    ff.stop(debug);
  }, 13000);

  const output = await ff.repeatAny(input, [0, 3, 3, 2, 1, 1], 50, 1000, debug); // repeat 50 times with delay of 1000 ms after each iteration

  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));



/*
 * Notice: Pause and stop are initiated immediatelly after function. No need to wait for iteration finish.


-------------- 1. (1000) repeatAny { i: 1, x: 5 }
fja1 5
--- fja1 --- [0](1000) fja1 -> 6

fja4 6
--- fja4 --- [3](1000) fja4 -> 7

fja4 7
--- fja4 --- [3](1000) fja4 -> 8

=== PAUSE ===
=== START ===
fja3 8
--- fja3 --- [2](1000) fja3 -> 9

fja2 9
--- fja2 --- [1](1000) fja2 -> 10

fja2 10
--- fja2 --- [1](1000) fja2 -> 11


-------------- 2. (1000) repeatAny { i: 2, x: 11 }
fja1 11
--- fja1 --- [0](1000) fja1 -> 12

fja4 12
--- fja4 --- [3](1000) fja4 -> 13

=== STOP ===
RES::  13

*/
