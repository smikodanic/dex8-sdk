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

  // sending output immediatelly and run ff in the background
  const output = await ff.repeatInterval({method: 'serialRange', args: [input, 1, 2, 800, debug]}, 3, 3000, debug); // repeat 3 times with delay of 3000 ms at the beginning of each iteration

  return output;
}


main(ff)
  .then(res => {
    console.log('RES:: ', res);
    console.log('FunctionFlow continue running in background!');
  })
  .catch(err => console.error('ERR:: ', err));


