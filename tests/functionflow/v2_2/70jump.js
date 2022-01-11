const FunctionFlow = require('../../../helpers/functionflow/FunctionFlow_v2.2');
const ff = new FunctionFlow({ debug: true, msDelay: 100 });

// functions
const f1 = (x, lib) => {
  console.log('f1', x);
  return x + 1;
};

const f2 = (x, lib) => {
  const ff = lib.ff;
  console.log('f2', x);
  if (ff.iteration === 2) { lib.ff.jump(10); } // on 2nd iteration jump to last iteration
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
    const y = await ff.repeat(10);

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
 f1 5
--- serial --- [0] f1 (400 ms) --> 6

f2 6
--- serial --- [1] f2 (400 ms) --> 7

f3 7
--- serial --- [2] f3 (400 ms) --> 8


-------------- 1. repeat/serial --------------
f1 8
--- serial --- [0] f1 (400 ms) --> 9

f2 9
--- serial --- [1] f2 (400 ms) --> 10

f3 10
--- serial --- [2] f3 (400 ms) --> 11


-------------- 2. repeat/serial --------------
f1 11
--- serial --- [0] f1 (400 ms) --> 12

f2 12
--- serial --- [1] f2 (400 ms) --> 13

f3 13
--- serial --- [2] f3 (400 ms) --> 14

f3 14
--- one --- [0] f3 (400 ms) --> 15


-------------- 1. repeat/one --------------
f3 15
--- one --- [0] f3 (400 ms) --> 16


-------------- 2. repeat/one --------------
f3 16
--- one --- [0] f3 (400 ms) --> 17


-------------- 3. repeat/one --------------
f3 17
--- one --- [0] f3 (400 ms) --> 18

RES::  18

 */
