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
  const msDelay = 800; // ms

  try {
    lib.ff.register(funcDefs);

    const output = await lib.ff.serialAny(input, [4, 2, 3], msDelay, debug); // will execute funcDefs[4], funcDefs[2] and funcDefs[3], e.g. fja5, fja3 and fja4
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
 fja4 5
--- serialAny --- [4](800) fja4 -> 6

fja2 6
--- serialAny --- [2](800) fja2 -> 7

fja3 7
--- serialAny --- [3](800) fja3 -> 8

RES::  8
 */
