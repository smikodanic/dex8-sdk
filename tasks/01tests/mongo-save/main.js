// files
const input = require('./input');
const mongoConnect = require('./mongoConnect');
const modifyInput = require('./modifyInput');
const mongoSave = require('./mongoSave');
const mongoDisconnect = require('./mongoDisconnect');



module.exports = async (ff) => {

  // register functions
  const funcDefs = [mongoConnect, modifyInput, mongoSave, mongoDisconnect];

  try {
    ff.register(funcDefs);
  } catch(err) { // catch registration errors
    ff.lib.echoErr(err);
  }

  // execution of registered functions
  const debug = false;
  const msDelay = 1300; // miliseconds
  let x = await ff.serialRange(input, 0, 2, msDelay, debug);
  x = await ff.repeatAny(x, [2], 3); // will repeat 'mongoSave' 3 times
  x = await ff.serialAny(x, [3], msDelay, debug); // disconnect from mongodb server

  const output = x;
  return output;
};
