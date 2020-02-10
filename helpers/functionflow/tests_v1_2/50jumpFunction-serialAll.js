const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'},
  {name: 'fja7', body: 'console.log(\'fja7\', x); return x + 1;'},
  {name: 'fja8', body: 'console.log(\'fja8\', x); return x + 1;'}, // jump here after 3000ms
  {name: 'fja9', body: 'console.log(\'fja9\', x); return x + 1;'},
  {name: 'fja10', body: 'console.log(\'fja10\', x); return x + 1;'},
];


const main = async (input, lib) => {
  const debug = true;
  const msDelay = 2000; // ms

  try {
    lib.ff.register(funcDefs);

    // JUMP
    setTimeout(() => {
    // ff.jumpFunction(-1, true); // breaks loop after fja2 and exits with result from fja2
    // ff.jumpFunction(0, true); // breaks loop after fja2 and exits with result from fja2 (because jump can not go backward)
    // ff.jumpFunction(1, true); // breaks loop after fja2 and exits with result from fja2 (because jump can not go backward)
      lib.ff.jumpFunction(7, true); // jump to fja8
    }, 3000);


    let x;
    x = await lib.ff.serialAll(input, msDelay, debug);
    x = await lib.ff.one(x, 1, msDelay, debug);

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

fja1 5
--- serialAll --- [0](2000) fja1 -> 6

fja2 6
--- serialAll --- [1](2000) fja2 -> 7

   ===JUMP to function i:7===
fja8 7
--- serialAll --- [7](2000) fja8 -> 8

fja9 8
--- serialAll --- [8](2000) fja9 -> 9

fja10 9
--- serialAll --- [9](2000) fja10 -> 10

fja2 10
--- one --- [1](2000) fja2 -> 11

RES::  11

 */

