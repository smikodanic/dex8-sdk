const FunctionFlow = require('../../../helpers/functionflow/FunctionFlow_v2.2');
const ff = new FunctionFlow({ debug: true, msDelay: 400 });

// functions
const f1 = (x, lib) => {
  console.log('f1', x);
  return x + 1;
};

const f2 = (x, lib) => {
  const ff = lib.ff;
  console.log('f2', x);
  ff.next(10);
  return x + 2;
};

const f3 = (x, lib) => {
  console.log('f3', x);
  return x + 3;
};





const main = async (input, lib) => {
  const ff = lib.ff;

  try {
    ff.xInject(input);
    ff.libInject(lib);

    const funcs = [f1, f2, f3];
    await ff.serial(funcs);
    const y = await ff.parallelRace(funcs);

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
Notice: f3 will not be executed inside serial() because f2 contains ff.next() which will force execution to jump on parallelrace()


--- serial --- start --- [0] f1 (400 ms) --- x:: 5
f1 5

--- serial --- start --- [1] f2 (400 ms) --- x:: 6
f2 6

   === next  ===


--- parallelRace --- start --- [race]  (400 ms) --- x:: 8
f1 8
f2 8
f3 8
RES::  9


*/
