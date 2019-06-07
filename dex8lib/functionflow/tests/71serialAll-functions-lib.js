const FunctionFlow = require('../FunctionFlow');
const ff = new FunctionFlow();


/** Inject these 2 libraries*/
const BPromise = require('bluebird');
const util = require('util');


// function definitions
function fja1(x, libs) {
  console.log(x);
  return x + 1;
}
const fja2 = function (x, lib) { // IMPORTANT: here 'libs' will not work. Use only arrow functions (x, libs) => {...}
  console.log(x);
  console.log(lib.util.inspect(lib.BPromise));
  return x + 1;
};
const fja3 = (x, lib) => {
  console.log(x);
  return x + 1;
};
const funcDefs = [fja1, fja2, fja3];

try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}


// inject libraries
ff.libInject({util, BPromise});



async function main(ff) {
  const debug = true;
  const msDelay = 130; // 130ms
  const input = 5;

  const output = await ff.serialAll(input, msDelay, debug);

  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

