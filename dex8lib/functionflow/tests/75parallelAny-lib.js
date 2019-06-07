/**
 * Example which shows how to inject Bluebird library.
 */
const FunctionFlow = require('../FunctionFlow');
const BPromise = require('bluebird');

const ff = new FunctionFlow();

// Notice: libs.BPromise is used
const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return new lib.BPromise(resolve => setTimeout(() => {resolve(x + 2)}, 1000))'}, // wait 1 second for promise to be fulfilled
  {name: 'fja2', body: 'console.log(\'fja2\', x); return new lib.BPromise(resolve => setTimeout(() => {resolve(x * 3)}, 3000))'}, // wait 3 seconds for promise to be fulfilled
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'}
];

try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}

// add bluebird
ff.libInject({BPromise});


async function main(ff) {
  const debug = true;
  const msDelay = 1000; // ms
  const input = 5;
  const output = await ff.parallelAny(input, [0, 1, 2], msDelay, debug); // parallelAny will send output after 3 seconds because fja2 will need the longest time interval to be fulfilled
  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

