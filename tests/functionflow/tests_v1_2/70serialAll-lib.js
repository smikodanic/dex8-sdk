const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();

/** Append those 2 libraries to lib parameter function(x, lib) **/
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



const main = async (input, lib) => {
  const debug = true;
  const msDelay = 600; // ms

  try {
    lib.ff.register(funcDefs);

    lib.ff.libInject({util});
    lib.ff.libAdd({BPromise});

    const output = await lib.ff.serialAll(input, msDelay, debug);
    return output;
  } catch(err) {
    throw err;
  }
};



const inp = 5;
const lib = {ff};

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));


