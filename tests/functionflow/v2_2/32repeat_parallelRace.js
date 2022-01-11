const FunctionFlow = require('../../../helpers/functionflow/FunctionFlow_v2.2');
const ff = new FunctionFlow({ debug: true, msDelay: 400 });

// functions
const f1 = (x, lib) => {
  console.log('f1', x);
  return new Promise(resolve => setTimeout(() => { resolve(x + 2); }, 1000));
};

const f2 = (x, lib) => {
  console.log('f2', x);
  return new Promise(resolve => setTimeout(() => { resolve(x * 3); }, 3000));
};

const f3 = (x, lib) => {
  console.log('f3', x);
  return x * 2;
};





const main = async (input, lib) => {
  const ff = lib.ff;

  try {
    ff.xInject(input);
    ff.libInject(lib);

    await ff.one(f2);
    await ff.repeat(2); // will repeat one

    await ff.parallelRace([f1, f2, f3]);
    const y = await ff.repeat(3); // will repeat parallelRace

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
 f2 5
--- one --- [0] f2 (400 ms) --> 15


-------------- 1. repeat/one --------------
f2 15
--- one --- [0] f2 (400 ms) --> 45


-------------- 2. repeat/one --------------
f2 45
--- one --- [0] f2 (400 ms) --> 135

f1 135
f2 135
f3 135
--- parallelRace --- [race]  (400 ms) --> 270


-------------- 1. repeat/parallelRace --------------
f1 270
f2 270
f3 270
--- parallelRace --- [race]  (400 ms) --> 540


-------------- 2. repeat/parallelRace --------------
f1 540
f2 540
f3 540
--- parallelRace --- [race]  (400 ms) --> 1080


-------------- 3. repeat/parallelRace --------------
f1 1080
f2 1080
f3 1080
--- parallelRace --- [race]  (400 ms) --> 2160

RES::  2160

 */
