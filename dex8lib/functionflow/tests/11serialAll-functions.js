/**
 * serialAll implementation with function definitions
 */
const FunctionFlow = require('../FunctionFlow');
const ff = new FunctionFlow();

// function definitions
function fja1(x) {
  console.log(x);
  return x + 1;
}
const fja2 = function (x) {
  console.log(x);
  return x + 1;
};
const fja3 = (x) => {
  console.log(x);
  return x + 1;
};
const funcDefs = [fja1, fja2, fja3];


try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}


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

