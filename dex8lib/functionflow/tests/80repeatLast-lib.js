/**
 * Example which shows how to inject Bluebird library.
 */
const FunctionFlow = require('../FunctionFlow');
const BPromise = require('bluebird');

const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: `
    // backtick definitions allow new line
    console.log(\'fja1\', x);
    return x + 1;
  `},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return new lib.BPromise(resolve => setTimeout(() => {resolve(x + 3)}, 3000))'}, // wait for 3 seconds
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'}
];

try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}

// inject Bluebird library
ff.libInject({BPromise});

async function main(ff) {
  const debug = true;
  const input = 5;

  let x;
  x = await ff.serialRange(input, 1, 2, 800, debug);
  x = await ff.serialAll(x, 800, debug);
  x = await ff.repeatLast(x, 3, 2000, debug); // repeat serialAll 3 times with delay of 2 seconds

  const output = x;
  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

