// files
const config = require('./config');
const input = require('./input');
const secrets = require('./secrets');
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
  const output = await ff.serialAll(input, msDelay, debug);

  ff.lib.echo('output-from-main: ', output);

  return output;
};
