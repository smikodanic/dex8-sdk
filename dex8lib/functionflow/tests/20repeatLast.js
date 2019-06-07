const FunctionFlow = require('../FunctionFlow');
const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'}
];


try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}


async function main(ff) {
  const debug = true;
  const input = 5;

  let x;
  x = await ff.serialRange(input, 1, 2, 800, debug);
  x = await ff.serialAll(x, 800, debug);
  x = await ff.repeatLast(x, 3, 2000, debug); // repeat serialAll 3 times with delay of 2 seconds

  /* Test for very big number of iterations (repeat serialAll 3 milion times with delay of 3000 ms after each iteration) */
  // x = await ff.repeatLast(x, 3000000, 1000, debug);


  const output = x;
  return output;
}


main(ff)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

