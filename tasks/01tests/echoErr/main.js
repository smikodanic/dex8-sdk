// files
const input = require('./input'); // 8
const func_err = require('./func_err');


module.exports = async function main(ff) {

  // register functions
  const funcDefs = [func_err];
  try {
    ff.register(funcDefs);
  } catch(err) { // catch registration errors
    ff.lib.echoErr(err);
  }

  ff.lib.echoMsg('input::', input);

  // execute functions
  const debug = false;
  const msDelay = 1300; // miliseconds
  const output = await ff.serialAll(input, msDelay, debug);

  const msg = `main-output: ${output}`;
  ff.lib.echo({action: null, msg, err: null});

  return output;
};
