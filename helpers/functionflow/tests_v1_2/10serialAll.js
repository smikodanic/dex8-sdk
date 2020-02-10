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
  const msDelay = 600; // ms

  try {
    lib.ff.register(funcDefs);

    const output = await lib.ff.serialAll(input, msDelay, debug);
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
 fja0 5
--- serialAll --- [0](130) fja0 -> 6

fja1 6
--- serialAll --- [1](130) fja1 -> 7

fja2 7
--- serialAll --- [2](130) fja2 -> 8

fja3 8
--- serialAll --- [3](130) fja3 -> 9

fja4 9
--- serialAll --- [4](130) fja4 -> 10

fja5 10
--- serialAll --- [5](130) fja5 -> 11

RES::  11
 */
