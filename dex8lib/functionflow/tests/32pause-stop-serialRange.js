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
  }, 15000);


  const debug = true;
  const msDelay = 2000; //ms
  const input = 5;
  const output = await ff.serialRange(input, 2, 9, msDelay, debug);

  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));


/**
 * Notice: serialRange is stopped at fja8 so fja10 is not reached at all.

fja3 5
--- serialRange --- [2](2000) fja3 -> 6

fja4 6
--- serialRange --- [3](2000) fja4 -> 7

=== PAUSE ===
=== START ===
fja5 7
--- serialRange --- [4](2000) fja5 -> 8

fja6 8
--- serialRange --- [5](2000) fja6 -> 9

fja7 9
--- serialRange --- [6](2000) fja7 -> 10

fja8 10
--- serialRange --- [7](2000) fja8 -> 11

=== STOP ===
RES::  11

 */

