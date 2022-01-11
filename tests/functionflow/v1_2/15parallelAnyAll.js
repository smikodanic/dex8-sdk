const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return new Promise(resolve => setTimeout(() => {resolve(x + 2)}, 1000))'}, // wait 1 second for promise to be fulfilled
  {name: 'fja2', body: 'console.log(\'fja2\', x); return new Promise(resolve => setTimeout(() => {resolve(x * 3)}, 3000))'}, // wait 3 seconds for promise to be fulfilled
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'}
];



const main = async (input, lib) => {
  const debug = true;
  const msDelay = 800; // ms

  try {
    lib.ff.register(funcDefs);

    // execute funcDefs[0], funcDefs[1], funcDefs[2] e.g. fja1, fja2, fja3 simultaneously
    // parallelAnyAll will send output after 3 seconds because fja2 will need the longest time interval to be fulfilled 
    const output = await lib.ff.parallelAnyAll(input, [0, 1, 2], msDelay, debug);

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
fja1 5
fja2 5
fja3 5
--- parallelAnyAll --- [0](800)  -> [ 7, 15, 6 ]

RES::  [ 7, 15, 6 ]
 */
