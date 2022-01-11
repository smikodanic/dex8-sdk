const FunctionFlow = require('../../../helpers/functionflow/FunctionFlow_v2.2');
const ff = new FunctionFlow({ debug: true, msDelay: 3400 });

// functions
const f1 = (x, lib) => {
  console.log('f1', x);
  return new Promise(resolve => setTimeout(() => { resolve(x + 2); }, 1000));
};

const f2 = (x, lib) => {
  console.log('f2', x);
  return new Promise(resolve => setTimeout(() => { resolve(x * 3); }, 3000));
};

const f3 = (x, lib) => {
  console.log('f3', x);
  return x + 1;
};





const main = async (input, lib) => {
  const ff = lib.ff;

  try {
    ff.xInject(input);
    ff.libInject(lib);

    // parallelAll will send output after 3 seconds because fja2 will need the longest time interval to be fulfilled (3 seconds)
    const y = await ff.parallelAll([f1, f2, f3]);
    return y; // or return ff.x;

  } catch (err) {
    throw err;
  }
};





const inp = 5;
const lib = { ff };

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

