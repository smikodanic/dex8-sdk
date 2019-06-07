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

  const input = 'Something!!!';

  // execute functions
  const debug = false;
  const msDelay = 1300; // miliseconds
  const x = await ff.serialAll(input, msDelay, debug);
  const output = await ff.repeatLast(x, 50000, msDelay, debug);

  return output;
};
