/**
 * 1. run 30pause-stop-serialAll.js
 * 2. run 31pause-stop-serialAll-control.js
 * Both script should started in same time in different consoles.
 *
 * Check if restart in 30pause-stop-serialAll.js will activate restart in 31pause-stop-serialAll-control.js
 * because of eventEmitter.emit('start') in FunctionFlow.js:455;
 */
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
  }, 4000);



  const debug = true;
  const msDelay = 2000; //ms
  const input = 5;
  const output = await ff.serialAll(input, msDelay, debug);

  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));


/**
 * Notice: This script stays in paused state even if eventEmitter.emit('start') is emitted from 30pause-stop-serialAll.js .
 * That's because eventEmitter is binded to FunctionFlow object.

fja1 5
--- serialAll --- [0](2000) fja1 -> 6

fja2 6
--- serialAll --- [1](2000) fja2 -> 7

=== PAUSE ===

 */

