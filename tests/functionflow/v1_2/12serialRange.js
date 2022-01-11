const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


const funcDefs = [
  {name: 'fja0', body: 'console.log(\'fja0\', x); return x + 1;'},
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'}
];



const main = async (input, lib) => {
  const debug = true;
  const msDelay = 1300; //ms

  try {
    lib.ff.register(funcDefs);

    const output = await lib.ff.serialRange(input, 2, 4, msDelay, debug);
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
--- serialRange --- [2](1300) fja2 -> 6

fja3 6
--- serialRange --- [3](1300) fja3 -> 7

fja4 7
--- serialRange --- [4](1300) fja4 -> 8

RES::  8

 */
