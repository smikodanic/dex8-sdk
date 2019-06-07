const FunctionFlow = require('../FunctionFlow');
const fs = require('fs');
const util = require('util');

const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: `
    console.log('fja3', x);
    console.log('++++++++++++++++++ ', lib.util.inspect(lib.fs.realpathSync));
    return x + 1;
  `},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'}
];

try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}

ff.libInject({fs, util});


async function main(ff) {
  const debug = true;
  const input = 5;

  const output = await ff.repeatFor({method: 'serialRange', args: [input, 1, 2, 800, debug]}, 5, 3000, debug); // repeat 5 times with delay of 3000 ms after each iteration

  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

