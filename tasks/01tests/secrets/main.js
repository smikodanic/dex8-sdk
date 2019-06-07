// files
const func1 = require('./func1');



module.exports = async function main(ff) {

  // register functions
  const funcDefs = [func1];
  try {
    ff.register(funcDefs);
  } catch(err) { // catch registration errors
    ff.lib.echoErr(err);
  }

  // execute functions
  const debug = false;
  const msDelay = 1300; // miliseconds
  const input = 3;

  const output = await ff.serialAll(input, msDelay, debug);

  ff.lib.echoMsg('output-from-main: ', output);

  return output;
};
