const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


/** Append those 2 libraries to lib parameter function(x, lib) **/
const BPromise = require('bluebird');
const util = require('util');


// function definitions
function fja0(x, lib) {
  console.log(x);
  return x + 1;
}
const fja1 = function (x, lib) { // IMPORTANT: here 'lib' will not work. Use only arrow functions (x, libs) => {...}
  console.log(x);
  console.log(lib.util.inspect(lib.BPromise));
  return x + 1;
};
const fja2 = (x, lib) => {
  console.log(x);
  return x + 1;
};


const funcDefs = [fja0, fja1, fja2];



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



