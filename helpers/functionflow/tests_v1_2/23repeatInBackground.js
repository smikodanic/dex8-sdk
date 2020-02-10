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
  const msDelay1 = 800; // ms
  const msDelay2 = 2100; // ms

  try {
    lib.ff.register(funcDefs);
    lib.ff.libInject(lib);

    // sending output immediatelly and run ff in the background
    const output = await lib.ff.repeatInBackground({method: 'serialRange', args: [input, 1, 2, msDelay1, debug]}, 3, msDelay2, debug); // repeat 3 times with delay of 3000 ms at the beginning of each iteration

    return output;
  } catch(err) {
    throw err;
  }
};



const inp = 5;
const lib = {ff};

main(inp, lib)
  .then(res => {
    console.log('RES:: ', res);
    console.log('ACC:: ', ff.acc);
    console.log('FunctionFlow resolved and continue running in background!');
  })
  .catch(err => console.error('ERR:: ', err));






