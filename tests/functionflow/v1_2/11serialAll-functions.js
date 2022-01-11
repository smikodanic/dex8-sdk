/**
 * serialAll implementation with real functions
 */
const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


// function definitions
function fja0(x) {
  console.log(x);
  return x + 1;
}
const fja1 = function (x) {
  console.log(x);
  return x + 1;
};
const fja2 = (x) => {
  console.log(x);
  return x + 1;
};
const funcDefs = [fja0, fja1, fja2];




const main = async (input, lib) => {
  const debug = true;
  const msDelay = 130; //ms

  try {
    lib.ff.register(funcDefs);

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

