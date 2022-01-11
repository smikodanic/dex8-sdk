/**
 * Use this script to test FunctionFlow methods during development.
 */


const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


const funcDefsAnonymous = [
  `const a = await Promise.resolve(2 * x);
     console.log(\'Wait for 5 seconds! ...\');
     return a;`,
  'await new Promise(resolve => setTimeout(resolve, 5000)); return x;', // delay
  // 'const err = new Error("intentional error !!!"); return Promise.reject(err);', // intentional error
  'return Promise.resolve(x + 1)'
];


const funcDefsNamed = [
  {
    name: 'fja1',
    body: `
      const a = await Promise.resolve(2 * x);
      return a;`
  },
  {
    name: 'fja2',
    body: 'console.log(\'Wait for 5 seconds! ...\'); await new Promise(resolve => setTimeout(resolve, 5000)); return x;', // delay
  },
  {
    name: 'fja3',
    body: 'console.log(\'Iz fja3\'); return x;',
  },
  {
    name: 'fja4',
    body: 'const err = new Error("intentional error !!!"); return Promise.reject(err);', // intentional error
  },
  {
    name: 'fja5',
    body: 'return Promise.resolve(x + 1)'
  }
];


const funcDefsNamed2 = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'}
];




async function main(input, lib) {
  const debug = true;

  try {
    lib.ff.register(funcDefsNamed2);

    //// SERIAL
    // let x = await lib.ff.serialAll(input, 50, debug);
    // x = await lib.ff.serialRange(input, 1, 2, 1000, debug);
    // const x = await lib.ff.serialAny(input, [0, 2, 1, 4, 1], 100, debug); // jump over error

    //// PARALLEL
    // const x = await lib.ff.parallelAnyAll(input, [0, 4, 2], 5000, debug);
    // const x = await lib.ff.parallelAnyRace(input, [0, 4, 2], 3000, debug);

    //// PARALLEL then SERIAL
    // let x = await lib.ff.parallelAnyAll(input, [0, 1, 2], 5000, debug); // [ 6, 6, 6 ]
    // x = await lib.ff.serialRange(x[1], 3, 5, 1000, debug);

    // x = await lib.ff.repeatLastMethod(x, 3, 3000, debug);
    const x = await lib.ff.repeatMethod({method: 'serialRange', args: [input, 1, 2, 1000, debug]}, 3, 2000, debug);

    const output = x;
    console.log('OUTPUT:: ', output);
    // const io = await ff.getIO();
    return output;

  } catch(err) {
    throw err;
  }

}





const inp = 3;
const lib = {ff};

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

