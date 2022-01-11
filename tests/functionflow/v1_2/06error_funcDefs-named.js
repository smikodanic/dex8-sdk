/**
 * Intentionally made error in third named function 'fja3'.
 * Use try-catch block to catch error.
 */
const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\\\'fja3\\\', x); return x + 1;'}, // bad definition
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'}
];

const main = async (input, lib) => {
  const debug = true;
  const msDelay = 130; //ms

  try {
    lib.ff.register(funcDefs);

    const output = await lib.ff.serialAll(input, msDelay, debug);
    return output;
  } catch(err) { // catch registration errors
    throw err;
  }
};




const inp = 5;
const lib = {ff};

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

