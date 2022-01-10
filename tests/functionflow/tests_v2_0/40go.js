const FunctionFlow = require('../index.js').v2_0;
const ff = new FunctionFlow({debug: true, msDelay: 400});

// functions
const f0 = (x, lib) => {
  x++;
  console.log('f0:: ', x);
  return x;
};

const f1 = (x, lib) => {
  x++;
  console.log('f1:: ', x);
  return x;
};

const f2 = (x, lib) => {
  x++;
  console.log('f2:: ', x);
  if (x < 13 ) { lib.ff.go(1); } // go back to f1
  return x;
};

const f3= (x, lib) => {
  x++;
  console.log('f3:: ', x);
  return x;
};

const f4 = (x, lib) => {
  x++;
  console.log('f4:: ', x);
  lib.ff.go(6); // go to f6 e.g. jump over f5
  return x;
};

const f5 = (x, lib) => {
  x++;
  console.log('f5:: ', x);
  return x;
};

const f6 = (x, lib) => {
  x++;
  console.log('f6:: ', x);
  return x;
};






const main = async (input, lib) => {
  const ff = lib.ff;

  try {
    ff.xInject(input);
    ff.libInject(lib);

    const y = await ff.serial([f0, f1, f2, f3, f4, f5, f6]);
    return y; // or return ff.x;

  } catch(err) {
    throw err;
  }
};



const inp = 5;
const lib = {ff};

main(inp, lib)
  .then(res => console.log('\n\nRES:: ', res))
  .catch(err => console.error('\n\nERR:: ', err));




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
