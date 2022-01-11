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
  {name: 'fja8', body: 'console.log(\'fja8\', x); return x + 1;'},
  {name: 'fja9', body: 'console.log(\'fja9\', x); return x + 1;'},
  {name: 'fja10', body: 'console.log(\'fja10\', x); return x + 1;'},
];


const main = async (input, lib) => {
  const debug = true;
  const msDelay = 2000; // ms

  try {
    lib.ff.register(funcDefs);

    // JUMP
    setTimeout(function () {
    // lib.ff.jump(-1, true); // breaks loop after fja2
    // lib.ff.jump(0, true); // breaks loop after fja2
      lib.ff.jumpFunction(7, true); // jump to fja8
    }, 3000);



    const output = await lib.ff.serialRange(input, 2, 9, msDelay, debug);
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

fja3 5
--- serialRange --- [2](2000) fja3 -> 6

fja4 6
--- serialRange --- [3](2000) fja4 -> 7

   ===JUMP to function i:7===
fja8 7
--- serialRange --- [7](2000) fja8 -> 8

fja9 8
--- serialRange --- [8](2000) fja9 -> 9

fja10 9
--- serialRange --- [9](2000) fja10 -> 10

RES::  10

 */

