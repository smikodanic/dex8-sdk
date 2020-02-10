const FunctionFlow = require('../index.js').v2_0;
const ff = new FunctionFlow({debug: true, msDelay: 800});

// functions
const f1 = (x, lib) => {
  x++;
  console.log('f1-return', x);
  return x;
};

const f2 = (x, lib) => {
  x++;
  console.log('f2-return', x);
  return x;
};

const f3 = (x, lib) => {
  x++;
  console.log('f3-return', x);
  console.log(lib);
  return x;
};






const main = async (input, lib) => {
  const ff = lib.ff;

  try {
    ff.xInject(input);
    ff.libInject(lib);

    const y = await ff.serial([f1, f2, f3, f1]);
    await ff.delay(3400);

    return y; // or return ff.x;

  } catch(err) {
    throw err;
  }
};



const inp = 5;
const lib = {ff};

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));




/*
--- serial --- start --- [0] f1 (800 ms) --- x:: 5
f1-return 6

--- serial --- start --- [1] f2 (800 ms) --- x:: 6
f2-return 7

--- serial --- start --- [2] f3 (800 ms) --- x:: 7
f3-return 8
{ ff:
   FunctionFlow {
     debug: true,
     msDelay: 800,
     status: 'start',
     lastExecuted: { method: 'serial', args: [Array] },
     repeatIteration: 0,
     acc: {},
     x: 7,
     lib: [Circular],
     delayID:
      Timeout {
        _called: true,
        _idleTimeout: 800,
        _idlePrev: null,
        _idleNext: null,
        _idleStart: 917,
        _onTimeout: [Function],
        _timerArgs: undefined,
        _repeat: null,
        _destroyed: false,
        [Symbol(unrefed)]: false,
        [Symbol(asyncId)]: 11,
        [Symbol(triggerId)]: 0 } } }

--- serial --- start --- [3] f1 (800 ms) --- x:: 8
f1-return 9

   === delay 3400 ===

RES::  9
*/
