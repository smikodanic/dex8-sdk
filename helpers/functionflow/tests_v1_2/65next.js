const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


const funcDefs = [
  {name: 'fja0', body: 'console.log(\'fja0\', x); return x + 1;'},
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); lib.ff.next(true); return x + 1;'}, // go to next serial method e.g. lib.ff.one()
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'}
];



const main = async (input, lib) => {
  const debug = true;
  const msDelay = 1300; // ms

  try {
    lib.ff.register(funcDefs);
    lib.ff.libInject(lib); // now we can use lib.ff.next(x, true);

    let x = await lib.ff.serialRange(input, 0, 1, msDelay, debug);
    x = await lib.ff.serialAny(x, [2, 3, 4], msDelay, debug);
    x = await lib.ff.one(x, 5, msDelay, debug);

    return x;
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

fja0 5
--- serialRange --- [0](1300) fja0 -> 6

fja1 6
--- serialRange --- [1](1300) fja1 -> 7

fja2 7
--- serialAny --- [2](1300) fja2 -> 8

fja3 8
   ===next===
--- serialAny --- [3](1300) fja3 -> 9

fja5 9
--- one --- [5](1300) fja5 -> 10

RES::  10

 */
