const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'}
];


const main = async (input, lib) => {
  const debug = true;
  const msDelay = 600; // ms

  try {
    lib.ff.register(funcDefs);

    // PAUSE
    setTimeout(function () {
      lib.ff.pause(true);
    }, 3000);

    // reSTART
    setTimeout(function () {
      lib.ff.start(true);
    }, 8000);

    // STOP
    setTimeout(function () {
      lib.ff.stop(true);
    }, 13000);


    let x;
    x = await lib.ff.serialRange(input, 1, 2, 100, debug);
    x = await lib.ff.serialAll(x, 800, debug);
    x = await lib.ff.repeatLastMethod(x, 45, 400, debug); // 45 repeats of serialAll with delay 400ms
    x = await lib.ff.one(x, 0, 100, debug); // will not be executed

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



/**
Notice:
1) repeatLastMethod is stopped in 2.nd iteration e.g. before defined 45.th iteration
2) ff.one() is not executed sue to STOP

fja2 5
--- serialRange --- [1](100) fja2 -> 6

fja3 6
--- serialRange --- [2](100) fja3 -> 7

fja1 7
--- serialAll --- [0](800) fja1 -> 8

fja2 8
--- serialAll --- [1](800) fja2 -> 9

fja3 9
--- serialAll --- [2](800) fja3 -> 10

fja4 10
--- serialAll --- [3](800) fja4 -> 11

   ===pause===
   ===start===

-------------- 1. (400) repeatLastMethod/serialAll [ 11, 800, true ]
fja1 11
--- serialAll --- [0](800) fja1 -> 12

fja2 12
--- serialAll --- [1](800) fja2 -> 13

fja3 13
--- serialAll --- [2](800) fja3 -> 14

fja4 14
--- serialAll --- [3](800) fja4 -> 15


-------------- 2. (400) repeatLastMethod/serialAll [ 15, 800, true ]
fja1 15
--- serialAll --- [0](800) fja1 -> 16

fja2 16
--- serialAll --- [1](800) fja2 -> 17

   ===stop===
RES::  17


 */
