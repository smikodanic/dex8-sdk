const FunctionFlow = require('../FunctionFlow');
const ff = new FunctionFlow();

/** Inject these 2 libraries*/
const BPromise = require('bluebird');
const util = require('util');

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); console.log(lib.util.inspect(lib.BPromise)); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'}
];

try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}

// add libraries
ff.libInject({util});
ff.libAdd({BPromise});


async function main(ff) {
  const debug = true;
  const msDelay = 130; //ms
  const input = 5;

  const output = await ff.serialAll(input, msDelay, debug);

  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

