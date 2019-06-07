// files
const input = require('./input'); // 8
const func1 = require('./func1');
const func2 = require('./func2');
const func3 = require('./func3');


module.exports = async function main(ff) {

  // register functions
  const funcDefs = [func1, func2, func3];
  try {
    ff.register(funcDefs);
  } catch(err) { // catch registration errors
    ff.lib.echoErr(err);
  }

  // execute functions
  const debug = false;
  const msDelay = 1300; // miliseconds
  const output = await ff.serialAll(input, msDelay, debug);

  ff.lib.echoMsg('output-from-main: ', output);

  return output;
};
