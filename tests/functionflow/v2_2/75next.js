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
  ff.next();
  return x + 1;
};

const f3 = (x, lib) => {
  console.log('f3', x);
  return x + 1;
};





const main = async (input, lib) => {
  const ff = lib.ff;

  try {
    ff.xInject(input);
    ff.libInject(lib);

    await ff.serial([f1, f2, f3]);
    await ff.serial([f1, f2, f3]);
    const y = await ff.serial([f1, f2, f3]);

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
Notice: f3 will be never executed because of ff.next() in f2


--- serial --- start --- [0] f1 (400 ms) --- x:: 5
f1 5

--- serial --- start --- [1] f2 (400 ms) --- x:: 6
f2 6

   === next  ===


--- serial --- start --- [0] f1 (400 ms) --- x:: 7
f1 7

--- serial --- start --- [1] f2 (400 ms) --- x:: 8
f2 8

   === next  ===


--- serial --- start --- [0] f1 (400 ms) --- x:: 9
f1 9

--- serial --- start --- [1] f2 (400 ms) --- x:: 10
f2 10

   === next  ===

RES::  11

*/
