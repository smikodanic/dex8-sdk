/**
 * Example which shows how to inject Bluebird library.
 */
const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();

const BPromise = require('bluebird');

const funcDefs = [
  {name: 'fja1', body: `
    // backtick definitions allow new line
    console.log(\'fja1\', x);
    return x + 1;
  `},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return new lib.BPromise(resolve => setTimeout(() => {resolve(x + 3)}, 3000))'}, // wait for 3 seconds
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'}
];




const main = async (input, lib) => {
  const debug = true;
  const msDelay = 600; // ms

  try {
    lib.ff.register(funcDefs);

    lib.ff.libInject(lib);
    lib.ff.libAdd({BPromise});

    let x;
    x = await lib.ff.serialRange(input, 1, 2, 800, debug);
    x = await lib.ff.serialAll(x, 800, debug);
    x = await lib.ff.repeatLastMethod(x, 2, 2000, debug); // repeat serialAll 2 times with delay of 2 seconds
    x = await lib.ff.one(x, 2, 800, debug); // fja3

    const output = x;
    return output;
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

 fja2 5
--- serialRange --- [1](800) fja2 -> 6

fja3 6
--- serialRange --- [2](800) fja3 -> 9

fja1 9
--- serialAll --- [0](800) fja1 -> 10

fja2 10
--- serialAll --- [1](800) fja2 -> 11

fja3 11
--- serialAll --- [2](800) fja3 -> 14

fja4 14
--- serialAll --- [3](800) fja4 -> 15


-------------- 1. (2000) repeatLastMethod/serialAll [ 15, 800, true ]
fja1 15
--- serialAll --- [0](800) fja1 -> 16

fja2 16
--- serialAll --- [1](800) fja2 -> 17

fja3 17
--- serialAll --- [2](800) fja3 -> 20

fja4 20
--- serialAll --- [3](800) fja4 -> 21


-------------- 2. (2000) repeatLastMethod/serialAll [ 21, 800, true ]
fja1 21
--- serialAll --- [0](800) fja1 -> 22

fja2 22
--- serialAll --- [1](800) fja2 -> 23

fja3 23
--- serialAll --- [2](800) fja3 -> 26

fja4 26
--- serialAll --- [3](800) fja4 -> 27

fja3 27
--- one --- [2](800) fja3 -> 30

RES::  30

 */
