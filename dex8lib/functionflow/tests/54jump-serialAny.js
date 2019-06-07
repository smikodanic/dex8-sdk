const FunctionFlow = require('../FunctionFlow');
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

try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}


async function main(ff) {

  // JUMP
  setTimeout(function () {
    ff.jump(10, 'function', true); // jump to fja10 --> 0, 1, 2  jump  5, 3, 6, 3
  }, 5000);

  const debug = true;
  const msDelay = 2000; //ms
  const input = 5;
  const output = await ff.serialAny(input, [0, 1, 2, 1, 2, 3, 4, 2, 3, 9, 5, 3, 6, 3], msDelay, debug);

  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));


/**
 *
fja1 5
--- serialAny --- [0](2000) fja1 -> 6

fja2 6
--- serialAny --- [1](2000) fja2 -> 7

fja3 7
--- serialAny --- [2](2000) fja3 -> 8

=== JUMP to function 10 ===
fja6 8
--- serialAny --- [5](2000) fja6 -> 9

fja4 9
--- serialAny --- [3](2000) fja4 -> 10

fja7 10
--- serialAny --- [6](2000) fja7 -> 11

fja4 11
--- serialAny --- [3](2000) fja4 -> 12

RES::  12
 */

