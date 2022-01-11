const FunctionFlow = require('../../../helpers/functionflow/FunctionFlow_v2.2');
const ff = new FunctionFlow({ debug: true, msDelay: 5500 });

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

    const y = await ff.one(f3);
    return y; // or return ff.x;

  } catch (err) {
    throw err;
  }
};



const inp = 5;
const lib = { ff };

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));



/*
 f3 5
{
  ff: FunctionFlow {
    debug: true,
    msDelay: 5500,
    status: 'start',
    lastExecuted: { method: 'one', args: [Array] },
    jumpTo: undefined,
    iteration: 0,
    msPause: 31536000000,
    x: 5,
    lib: [Circular]
  }
}
--- one --- [0] f3 (5500 ms) --> 6

RES::  6
 */
