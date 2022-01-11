/**
 * Intentionally made error in third named function 'fja3'.
 * Mixed function definitions will cause error.
 */
const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


const fja3 = () => {
  console.log('This is real function.');
};

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  fja3,
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'}
];




async function main(input, lib) {
  const debug = true;
  const msDelay = 130; //ms

  try {
    lib.ff.register(funcDefs);

    const output = await lib.ff.serialAll(input, msDelay, debug);
    return output;
  } catch(err) { // catch registration errors
    throw err;
  }
}




const inp = 5;
const lib = {ff};

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

