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

  try {
    lib.ff.register(funcDefs);

    let x;
    x = await lib.ff.serialRange(input, 1, 2, 800, debug);
    x = await lib.ff.serialAll(x, 800, debug);
    x = await lib.ff.repeatLastMethod(x, 3, 2000, debug); // repeat serialAll method 3 times with delay of 2 seconds

    /* Test for very big number of iterations (repeat serialAll 3 milion times with delay of 3000 ms after each iteration) */
    // x = await ff.repeatLastMethod(x, 3000000, 1000, debug);


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
--- serialRange --- [2](800) fja3 -> 7

fja1 7
--- serialAll --- [0](800) fja1 -> 8

fja2 8
--- serialAll --- [1](800) fja2 -> 9

fja3 9
--- serialAll --- [2](800) fja3 -> 10

fja4 10
--- serialAll --- [3](800) fja4 -> 11


-------------- 1. (2000) repeatLastMethod/serialAll [ 11, 800, true ]
fja1 11
--- serialAll --- [0](800) fja1 -> 12

fja2 12
--- serialAll --- [1](800) fja2 -> 13

fja3 13
--- serialAll --- [2](800) fja3 -> 14

fja4 14
--- serialAll --- [3](800) fja4 -> 15


-------------- 2. (2000) repeatLastMethod/serialAll [ 15, 800, true ]
fja1 15
--- serialAll --- [0](800) fja1 -> 16

fja2 16
--- serialAll --- [1](800) fja2 -> 17

fja3 17
--- serialAll --- [2](800) fja3 -> 18

fja4 18
--- serialAll --- [3](800) fja4 -> 19


-------------- 3. (2000) repeatLastMethod/serialAll [ 19, 800, true ]
fja1 19
--- serialAll --- [0](800) fja1 -> 20

fja2 20
--- serialAll --- [1](800) fja2 -> 21

fja3 21
--- serialAll --- [2](800) fja3 -> 22

fja4 22
--- serialAll --- [3](800) fja4 -> 23

RES::  23

 */
